import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import { BrowserRouter } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import App from './containers/App/App';
import './assert/css/font-awesome.min.css';
import './index.scss';
import { detailsReducer, favoritesReducer, mainReducer } from './store/reducers';
import { watchDetails, watchFavorites, watchMain } from './store/sagas';

const composeEnhancers = process.env.NODE_ENV === 'development' ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : null || compose;
const rootReducer = combineReducers({
  details: detailsReducer,
  favorites: favoritesReducer,
  main: mainReducer
});
const sagaMiddleware = createSagaMiddleware();
const store = createStore(rootReducer, composeEnhancers(applyMiddleware(sagaMiddleware)));
sagaMiddleware.run(watchDetails);
sagaMiddleware.run(watchFavorites);
sagaMiddleware.run(watchMain);
const app = (
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
ReactDOM.render(app, document.getElementById('root'));
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();