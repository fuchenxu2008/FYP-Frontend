import React, { Component } from 'react';
import ReactMapGL, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import PolylineOverlay from './PolylineOverlay.jsx';
import { MapBoxToken } from '../config';

export default class Map extends Component {
  state = {
    width: 0,
    height: 0,
    viewport: {
      latitude: 37.6680987,
      longitude: -122.3936063,
      zoom: 10
    }
  };

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions = () => {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  _goToNYC = () => {
    const viewport = {...this.state.viewport, longitude: -74.1, latitude: 40.7};
    this.setState({viewport});
  }

  render() {
    const { width, height } = this.state;
    const { nodes } = this.props;
    return (
      <div>
        <ReactMapGL
          {...this.state.viewport}
          width={width}
          height={height}
          mapboxApiAccessToken={MapBoxToken}
          onViewportChange={viewport => this.setState({ viewport })}
        >
          <PolylineOverlay points={nodes} />
        </ReactMapGL>
      </div>
    );
  }
}
