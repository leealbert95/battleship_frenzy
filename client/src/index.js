import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { BrowserRouter, Route } from 'react-router-dom';
import App from './App.js';
import registerServiceWorker from './registerServiceWorker';

import Reducer from './reducers';

const store = createStore(Reducer, {status: 'offline', username: ''})
console.log(store.getState());

ReactDOM.render(
	<div>
		<Provider store={store}>
			<BrowserRouter>
				<Route component={App}/>
			</BrowserRouter>
		</Provider>
	</div>,
	document.getElementById('root')
	);
registerServiceWorker();
