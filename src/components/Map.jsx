import React, { Component } from 'react';
import ReactMapGL, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import PolylineOverlay from './PolylineOverlay.jsx';
import { MapBoxToken } from '../config';

export default class Map extends Component {
  state = {
    map: null,
    width: 0,
    height: 0,
    viewport: {
      latitude: 37.73,
      longitude: -122.45,
      zoom: 10
    },
  };

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);

    const map = this.reactMap.getMap();
    map.on('load', () => {
      this.setState({ map }, this._addGeoJSON);
      const layers = map.getStyle().layers;

      let labelLayerId;
      for (let i = 0; i < layers.length; i++) {
        if (
          layers[i].type === 'symbol' &&
          layers[i].layout['text-field']
        ) {
          labelLayerId = layers[i].id;
          break;
        }
      }
      map.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
          'fill-extrusion-color': '#aaa',
          // use an 'interpolate' expression to add a smooth transition effect to the
          // buildings as the user zooms in
          'fill-extrusion-height': [
            "interpolate", ["linear"], ["zoom"],
            15, 0,
            15.05, ["get", "height"]
          ],
          'fill-extrusion-base': [
            "interpolate", ["linear"], ["zoom"],
            15, 0,
            15.05, ["get", "min_height"]
          ],
          'fill-extrusion-opacity': .6
        }
      }, labelLayerId);
    })
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions = () => {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.traversed && nextProps.traversed !== this.props.traversed)
      this._renderTraversedPoints(nextProps.traversed);
  }

  _addGeoJSON = () => {
    const polygon = {"type":"FeatureCollection","name":"sfo_poly","crs":{"type":"name","properties":{"name":"urn:ogc:def:crs:EPSG::3857"}},"features":[{"type":"Feature","properties":{"POLY_ID":1},"geometry":{"type":"Polygon","coordinates":[[[-122.39360652430645,37.668098718417596],[-122.39470050748879,37.66708364860348],[-122.39653347268842,37.66769728003766],[-122.39585969496682,37.66921126486574],[-122.39360652430645,37.668098718417596]]]}}]};
    //add the GeoJSON layer here
    this.state.map.addLayer({
      id: polygon.name,
      type: 'fill',
      source: {
        type: 'geojson',
        data: polygon
      },
      layout: {},
      paint: {
        'fill-color': '#088',
        'fill-opacity': 0.8
      }
    });
  }

  _renderTraversedPoints = (geojson) => {
    this.state.map.addLayer({
      id: geojson.name + Date.now(),
      type: 'symbol',
      source: {
        type: 'geojson',
        data: geojson
      },
      layout: {
        'icon-image': 'circle-15',
        'icon-size': 0.5
      },
    });
  }

  _goToNYC = () => {
    const viewport = { ...this.state.viewport, longitude: -74.1, latitude: 40.7 };
    this.setState({ viewport });
  }

  _handleDropPin = (e) => {
    const { source, dest, onAddPin } = this.props;
    if (source && dest) {
      onAddPin({ source: null, dest: null })
    } else {
      onAddPin({
        source,
        dest,
        [source ? 'dest' : 'source']: e.lngLat,
      });
    }
  }

  _onPinDragEnd = (type, e) => {
    const { source, dest, onAddPin } = this.props;
    onAddPin({
      source,
      dest,
      [type]: e.lngLat
    });
  }

  render() {
    const { width, height } = this.state;
    const { route, source, dest } = this.props;
    const routeEndPoint = (type, point) => (
      <Marker
        longitude={point[0]}
        latitude={point[1]}
        draggable
        onDragEnd={this._onPinDragEnd.bind(this, type)}
      >
        <div style={styles.marker}>{type === 'source' ? '🚖' : '🏖'}</div>
      </Marker>
    );

    return (
      <ReactMapGL
        ref={reactMap => (this.reactMap = reactMap)}
        {...this.state.viewport}
        width={width}
        height={height}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxApiAccessToken={MapBoxToken}
        onViewportChange={viewport => this.setState({ viewport })}
        onClick={this._handleDropPin}
      >
        {route.length && <PolylineOverlay points={route} color="#4569F7" />}
        {source && routeEndPoint('source', source)}
        {dest && routeEndPoint('dest', dest)}
        <div style={styles.navControl}>
          <NavigationControl
            onViewportChange={viewport => this.setState({ viewport })}
          />
        </div>
      </ReactMapGL>
    );
  }
}

const styles = {
  marker: {
    fontSize: '35px',
    transform: 'translate(-50%, -50%)'
  },
  traversedNode: {
    width: '5px',
    height: '5px',
    backgroundColor: 'red',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)'
  },
  navControl: {
    position: 'absolute',
    right: '10px',
    bottom: '50px'
  }
};