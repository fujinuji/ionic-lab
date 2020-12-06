import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { login as loginApi } from '../api/authApi';
import { Plugins } from '@capacitor/core';

const log = getLogger('AuthProvider');

type LoginFn = (username?: string, password?: string) => void;

export interface AuthState {
  authenticationError: Error | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  login?: LoginFn;
  logout?: () => void,
  pendingAuthentication?: boolean;
  username?: string;
  password?: string;
  token: string;
  _id: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isAuthenticating: false,
  authenticationError: null,
  pendingAuthentication: false,
  token: '',
  _id: ''
};

export const AuthContext = React.createContext<AuthState>(initialState);

interface AuthProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const { isAuthenticated, isAuthenticating, authenticationError, pendingAuthentication, token, _id } = state;
  const login = useCallback<LoginFn>(loginCallback, []);
  const logout = useCallback<any>(() => {
    (async () => {
      const { Storage } = Plugins;
      await Storage.remove({ key: 'user_token' });
      setState({ ...initialState });
    })();
  }, []);
  useEffect(authenticationEffect, [pendingAuthentication]);
  useEffect(() => {
    (async () => {
      const { Storage } = Plugins;
      const res = await Storage.get({ key: 'user_token' });
      if (res.value) {
        setState({ ...state, isAuthenticated: true, token: res.value });
      }
    })();
    //eslint-disable-next-line
  }, []);
  const value = { isAuthenticated, login, logout, isAuthenticating, authenticationError, token, _id };
  log('render');
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );

  function loginCallback(username?: string, password?: string): void {
    log('login');
    setState({
      ...state,
      pendingAuthentication: true,
      username,
      password
    });
  }

  function authenticationEffect() {
    let canceled = false;
    authenticate();
    return () => {
      canceled = true;
    }

    async function authenticate() {
      if (!pendingAuthentication) {
        log('authenticate, !pendingAuthentication, return');
        return;
      }
      try {
        log('authenticate...');
        setState({
          ...state,
          isAuthenticating: true,
        });
        const { username, password } = state;
        const { token } = await loginApi(username, password);
        const { Storage } = Plugins;
        await Storage.set({
          key: 'user_token',
          value: token
        });
        if (canceled) {
          return;
        }
        log('authenticate succeeded');
        setState({
          ...state,
          token,
          pendingAuthentication: false,
          isAuthenticated: true,
          isAuthenticating: false,
        });
      } catch (error) {
        if (canceled) {
          return;
        }
        log('authenticate failed');
        setState({
          ...state,
          authenticationError: error,
          pendingAuthentication: false,
          isAuthenticating: false,
        });
      }
    }
  }
};
