import React from 'react';
import ReactDOM from 'react-dom';
import App from './containers/App/App';
import './assert/css/font-awesome.min.css';
import './index.scss';
import { BrowserRouter } from 'react-router-dom';
import * as serviceWorker from './serviceWorker';

const app = (
	<BrowserRouter>
		<App />
	</BrowserRouter>
);
ReactDOM.render(app, document.getElementById('root'));
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
//serviceWorker.unregister();
serviceWorker.register();