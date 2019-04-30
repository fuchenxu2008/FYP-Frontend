import React, { Component } from 'react'
import io from 'socket.io-client';
import Map from './components/Map.jsx';
import { DOMAIN_URL } from './config';
import './App.css';

export default class App extends Component {
  state = {
    socket: null,
    nodes: [],
  }

  componentDidMount() {
    this._connectSocket();
  }

  _connectSocket = () => {
    const socket = io.connect(DOMAIN_URL);
    socket.on('connect', () => {
      console.log('Connected to socket');
    })
    this.setState({ socket });
  }

  _runAStar = () => {
    const { socket } = this.state;
    if (!socket) return;
    socket.emit('runAStar');
    socket.on('AStarResult', result => {
      console.log('result: ', result);
      this.setState({ nodes: result });
      socket.off('AStarResult');
    });
    socket.on('AStar_benchmark', benchmark => {
      console.log('benchmark: ', benchmark);
      socket.off('AStar_benchmark');
    });
  }

  _runDijkstra = () => {
    const { socket } = this.state;
    if (!socket) return;
    socket.emit('runDijkstra');
    socket.on('DijkstraResult', result => {
      console.log('result: ', result);
      this.setState({ nodes: result });
      socket.off('DijkstraResult');
    });
    socket.on('Dijkstra_benchmark', benchmark => {
      console.log('benchmark: ', benchmark);
      socket.off('Dijkstra_benchmark');
    });
  }

  _runBestFS = () => {
    const { socket } = this.state;
    if (!socket) return;
    socket.emit('runBestFS');
    socket.on('BestFSResult', result => {
      console.log('result: ', result);
      this.setState({ nodes: result });
      socket.off('BestFSResult');
    });
    socket.on('BestFS_benchmark', benchmark => {
      console.log('benchmark: ', benchmark);
      socket.off('BestFS_benchmark');
    });
  }

  render() {
    return (
      <div className="App">
        <div style={styles.header}>
          <h1>
            Finding the shortest path under polygonal obstacle constraints
          </h1>
          <div>
            <button onClick={this._runAStar}>Run A Star</button>
            <button onClick={this._runDijkstra}>Run Dijkstra</button>
            <button onClick={this._runBestFS}>Run Best First Search</button>
          </div>
        </div>
        <Map nodes={this.state.nodes} />
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
  }
}