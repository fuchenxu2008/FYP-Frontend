import React, { Component } from 'react'
import io from 'socket.io-client';
import Map from './components/Map.jsx';
import { DOMAIN_URL } from './config';
import './App.css';

export default class App extends Component {
  state = {
    socket: null,
    route: [], // [[lon, lat]]
    source: null,
    dest: null,
  }

  componentDidMount() {
    this._connectSocket();
  }

  _connectSocket = () => {
    const socket = io.connect(DOMAIN_URL);
    socket.on('connect', () => {
      console.log('√ Connected to socket');
    })
    this.setState({ socket });
  }

  _setSourceDest = ({ source, dest }) => {
    this.setState({ source, dest });
  }

  _runAStar = () => {
    const { socket, source, dest } = this.state;
    if (!socket) return;
    socket.emit('runAStar', { source, dest });
    socket.on('AStarResult', result => {
      console.log('result: ', result);
      this.setState({ route: result });
      socket.off('AStarResult');
    });
    socket.on('AStar_benchmark', benchmark => {
      console.log('benchmark: ', benchmark);
      socket.off('AStar_benchmark');
    });
  }

  _runDijkstra = () => {
    const { socket, source, dest } = this.state;
    if (!socket) return;
    socket.emit('runDijkstra', { source, dest });
    socket.on('DijkstraResult', result => {
      console.log('result: ', result.length);
      this.setState({ route: result });
      socket.off('DijkstraResult');
    });
    socket.on('Dijkstra_benchmark', benchmark => {
      console.log('benchmark: ', benchmark);
      socket.off('Dijkstra_benchmark');
    });
  }

  _runBestFS = () => {
    const { socket, source, dest } = this.state;
    if (!socket) return;
    socket.emit('runBestFS', { source, dest });
    socket.on('BestFSResult', result => {
      console.log('result: ', result.length);
      this.setState({ route: result });
      socket.off('BestFSResult');
    });
    socket.on('BestFS_benchmark', benchmark => {
      console.log('benchmark: ', benchmark);
      socket.off('BestFS_benchmark');
    });
  }

  render() {
    const { source, dest, route } = this.state;

    return (
      <div className="App">
        <div style={styles.header}>
          <h1>
            Finding the shortest path under polygonal obstacle constraints
          </h1>
          <div>
            <button onClick={this._runAStar} style={styles.button}>Run A Star</button>
            <button onClick={this._runDijkstra} style={styles.button}>Run Dijkstra</button>
            <button onClick={this._runBestFS} style={styles.button}>Run Best First Search</button>
          </div>
        </div>
        <Map
          route={route}
          source={source}
          dest={dest}
          onAddPin={this._setSourceDest}
        />
      </div>
    );
  }
}

const styles = {
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    padding: '0 4%',
    color: 'rgb(50, 50, 50)',
    backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 100%)',
  },
  button: {
    border: 'none',
    borderRadius: '15px',
    padding: '5px 15px',
    fontSize: '15px',
    marginRight: '10px',
    color: 'rgb(50, 50, 50)',
    backgroundColor: 'white',
    cursor: 'pointer',
    outline: 0,
  }
};