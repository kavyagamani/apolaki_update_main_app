/**
 * Viber OAuth Strategy for Passport
 * Custom implementation for Viber authentication
 */

import axios from 'axios';
import { Strategy as PassportStrategy } from 'passport-strategy';

export default class ViberStrategy extends PassportStrategy {
  constructor(options, verify) {
    super();
    this.name = 'viber';
    
    if (!options.clientID) {
      throw new TypeError('ViberStrategy requires a clientID option');
    }
    if (!options.clientSecret) {
      throw new TypeError('ViberStrategy requires a clientSecret option');
    }
    if (!verify) {
      throw new TypeError('ViberStrategy requires a verify callback');
    }

    this._clientID = options.clientID;
    this._clientSecret = options.clientSecret;
    this._callbackURL = options.callbackURL;
    this._verify = verify;
    this._scope = options.scope || ['profile', 'contact'];
  }

  authenticate(req, options) {
    options = options || {};

    const code = req.query.code;
    const state = req.query.state;

    if (!code) {
      const params = {
        client_id: this._clientID,
        redirect_uri: this._callbackURL,
        scope: this._scope.join(' '),
        state: state || this._generateState(req),
        response_type: 'code'
      };

      const authURL = `https://www.viber.com/oauth/v1/authorize?${new URLSearchParams(params).toString()}`;
      return this.redirect(authURL);
    }

    // Exchange code for token
    this._oauth2.getOAuthAccessToken(
      code,
      {
        grant_type: 'authorization_code',
        client_id: this._clientID,
        client_secret: this._clientSecret,
        redirect_uri: this._callbackURL
      },
      (err, accessToken, refreshToken, params) => {
        if (err) {
          return this.fail({ message: err.message });
        }

        // Get user profile with token
        this._getUserProfile(accessToken, (err, profile) => {
          if (err) {
            return this.fail({ message: err.message });
          }

          const verified = (err, user, info) => {
            if (err) {
              return this.error(err);
            }
            if (!user) {
              return this.fail(info);
            }
            this.success(user, info);
          };

          this._verify(accessToken, refreshToken, profile, verified);
        });
      }
    );
  }

  _getUserProfile(accessToken, done) {
    axios({
      method: 'GET',
      url: 'https://api.viber.com/v1/users/profile',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
      .then(response => {
        const profile = {
          id: response.data.id,
          displayName: response.data.name,
          name: {
            givenName: response.data.name,
            familyName: response.data.last_name || ''
          },
          email: response.data.email,
          phoneNumber: response.data.phone,
          avatar: response.data.avatar,
          _json: response.data
        };
        done(null, profile);
      })
      .catch(err => {
        done(err);
      });
  }

  _generateState(req) {
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('hex');
  }
}
