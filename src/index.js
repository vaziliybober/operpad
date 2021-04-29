import ReactDOM from 'react-dom';

import '../assets/application.scss';
import createApp from './createApp.jsx';

ReactDOM.render(createApp(), document.getElementById('chat'));
