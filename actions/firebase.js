import { firebaseAuth, firebaseDb } from '../utils/firebase';
import {
  INIT_AUTH,
  SIGN_IN_ERROR,
  SIGN_IN_SUCCESS,
  SIGN_OUT_SUCCESS,
  NOT_SIGNED_IN,
  HAS_ERROR,
  RESET_ERRORS
} from './types';

const usersRef = firebaseDb.ref('users');

/* Check Auth
=================================================== */
export function checkAuth() {
  return dispatch => {
    firebaseAuth.onAuthStateChanged(user => {
      if (user) dispatch({ type: INIT_AUTH, payload: user });
      else dispatch({ type: NOT_SIGNED_IN });
    });
  };
}
/* Sign in / Sign off actions
=================================================== */
export function signInError(error) {
  return {
    type: SIGN_IN_ERROR,
    payload: error
  };
}
export function signInSuccess(result) {
  return {
    type: SIGN_IN_SUCCESS,
    payload: result
  };
}
export function signOutSuccess() {
  return {
    type: SIGN_OUT_SUCCESS
  };
}
export function signOut() {
  return dispatch => {
    firebaseAuth.signOut()
      .then(() => dispatch(signOutSuccess()));
  };
}
/* Provider Signup
=================================================== */
export function createProfileFromProvider(result) {
  return dispatch => {
    const userRef = usersRef.child(result.uid);
    const userInfo = {
      uid: result.uid,
      providerUid: result.providerData[0].uid,
      displayName: result.providerData[0].displayName,
      email: result.providerData[0].email,
      providerType: result.providerData[0].providerId,
      photoURL: result.providerData[0].photoURL
    };
    userRef.update(userInfo, error => {
      if (error) {
        console.error('ERROR @ User :', error);
      } else {
        dispatch({
          type: SIGN_IN_SUCCESS,
          payload: result
        });
      }
    });
  };
}
function authenticate(provider) {
  firebaseAuth.signInWithRedirect(provider)
    .then(result => createProfileFromProvider(result.user))
    .catch(error => signInError(error));
}
export function signInWithGoogle() {
  return authenticate(new firebaseAuth.GoogleAuthProvider());
}
export function signInWithTwitter() {
  return authenticate(new firebaseAuth.TwitterAuthProvider());
}
export function signInWithGithub() {
  const provider = new firebaseAuth.GithubAuthProvider();
  const scopes = ['user', 'repo', 'delete_repo', 'read:org', 'write:org'];
  scopes.map(scope => provider.addScope(scope));
  return authenticate(provider);
}
export function signInWithFacebook() {
  const provider = new firebaseAuth.FacebookAuthProvider();
  const scopes = ['email'];
  scopes.map(scope => provider.addScope(scope));
  return authenticate(provider);
}

/* Email Signup
=================================================== */
export function createProfileFromEmail(result, firstName, lastName) {
  return dispatch => {
    const userRef = usersRef.child(result.uid);
    const userInfo = {
      uid: result.uid,
      email: result.email,
      firstName,
      last_name: lastName
    };
    userRef.update(userInfo, error => {
      if (error) {
        console.error('ERROR @ User :', error);
      } else {
        dispatch({
          type: SIGN_IN_SUCCESS,
          payload: result.user
        });
      }
    });
  };
}
export function createUserWithEmail(props) {
  const { email, password, firstName, lastName } = props;
  console.log('create an account using', { email, password, firstName, lastName });
  return (dispatch) => {
    firebaseAuth.createUserWithEmailAndPassword(email, password)
      .then(result => dispatch(createProfileFromEmail(result, firstName, lastName)))
      .catch(error => dispatch(signInError(error)));
  };
}
export function signInWithEmail(props) {
  const { email, password } = props;
  return dispatch => {
    firebaseAuth.signInWithEmailAndPassword(email, password)
      .then(result => dispatch(signInSuccess(result)))
      .catch(error => dispatch(signInError(error)));
  };
}

/* Has Error
=================================================== */
export function hasError(error) {
  return {
    type: HAS_ERROR,
    payload: error
  };
}
export function resetErrors() {
  return {
    type: RESET_ERRORS
  };
}
