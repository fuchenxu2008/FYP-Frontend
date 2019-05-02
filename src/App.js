import React, { Component } from 'react'
import io from 'socket.io-client';
import Map from './components/Map.jsx';
import Benchmark from './components/Benchmark';
import { DOMAIN_URL } from './config';
import emitter from './utils/Event';
import './App.css';

export default class App extends Component {
  state = {
    socket: null,
    obstacles: null, // geojson
    source: null,
    dest: null,
    route: [], // [[lon, lat]]
    traversed: null, // geojson
    benchmark: {},
    showBenchmarkCard: false,
  }

  componentDidMount() {
    this._connectSocket();
  }

  _connectSocket = () => {
    const socket = io.connect(DOMAIN_URL);
    socket.on('connect', () => {
      console.log('√ Connected to socket');
    })
    socket.on('obstacles', (obstacles) => {
      console.log('obstacles: ', obstacles);
      this.setState({ obstacles });
    });
    this.setState({ socket });
  }

  _setSourceDest = ({ source, dest }) => {
    this.setState({ source, dest });
  }

  _runAStar = () => {
    const { socket, source, dest } = this.state;
    if (!socket) return;
    socket.emit('runAStar', { source, dest });
    socket.on('AStarRoute', route => {
      console.log('route: ', route);
      this.setState({ route });
      socket.off('AStarRoute');
    });
    socket.on('AStarTraversed', traversed => {
      console.log('traversed: ', traversed);
      this.setState({ traversed });
      socket.off('AStarTraversed');
    });
  }

  _runDijkstra = () => {
    const { socket, source, dest } = this.state;
    if (!socket) return;
    socket.emit('runDijkstra', { source, dest });
    socket.on('DijkstraRoute', route => {
      console.log('route: ', route);
      this.setState({ route });
      socket.off('DijkstraRoute');
    });
    socket.on('DijkstraTraversed', traversed => {
      console.log('traversed: ', traversed);
      this.setState({ traversed });
      socket.off('DijkstraTraversed');
    });
  }

  _runBestFS = () => {
    const { socket, source, dest } = this.state;
    if (!socket) return;
    socket.emit('runBestFS', { source, dest });
    socket.on('BestFSRoute', route => {
      console.log('route: ', route);
      this.setState({ route });
      socket.off('BestFSRoute');
    });
    socket.on('BestFSTraversed', traversed => {
      console.log('traversed: ', traversed);
      this.setState({ traversed });
      socket.off('BestFSTraversed');
    });
  }

  _runBenchmark = () => {
    const { socket, source, dest } = this.state;
    if (!socket) return;
    socket.emit('runBenchmark', { source, dest });
    socket.on('benchmark', benchmark => {
      console.log('benchmark: ', benchmark);
      this.setState((prevState) => ({
        benchmark: {
          ...prevState.benchmark,
          [benchmark.name]: benchmark
        }
      }))
    });
    this.setState({ showBenchmarkCard: true });
  }

  _focusMap = () => {
    emitter.emit('focusMap');
  }

  _closeBenchmarkCard = () => {
    this.setState({
      showBenchmarkCard: false,
      benchmark: {},
    });
  }

  render() {
    const { obstacles, source, dest, route, traversed, showBenchmarkCard, benchmark } = this.state;

    return (
      <div className="App">
        <div style={styles.header}>
          <h1 style={styles.h1}>
            Finding the shortest path under polygonal obstacle constraints
          </h1>
          <div>
            <button onClick={this._runAStar} style={styles.button}>A Star</button>
            <button onClick={this._runDijkstra} style={styles.button}>Dijkstra</button>
            <button onClick={this._runBestFS} style={styles.button}>Best First Search</button>
            <button onClick={this._runBenchmark} style={styles.button}>Benchmark</button>
            <button onClick={this._focusMap} style={styles.button}>Focus</button>
          </div>
        </div>
        <Map
          obstacles={obstacles}
          source={source}
          dest={dest}
          route={route}
          traversed={traversed}
          onAddPin={this._setSourceDest}
        />
        {showBenchmarkCard && <Benchmark benchmark={benchmark} onClose={this._closeBenchmarkCard} />}
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
    padding: '1% 4%',
    color: 'rgb(50, 50, 50)',
    backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 100%)',
  },
  h1: {
    marginBlockStart: '0.37em',
    marginBlockEnd: '0.37em'
  },
  button: {
    border: 'none',
    borderRadius: '15px',
    padding: '5px 15px',
    fontSize: '15px',
    margin: '3px 10px 3px 0',
    color: 'rgb(50, 50, 50)',
    backgroundColor: 'white',
    cursor: 'pointer',
    outline: 0,
  }
};