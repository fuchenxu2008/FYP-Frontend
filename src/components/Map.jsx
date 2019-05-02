import React, { Component } from 'react';
import ReactMapGL, {
  Marker,
  NavigationControl,
  FlyToInterpolator
} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapBoxToken } from '../config';
import emitter from '../utils/Event';

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
    window.addEventListener('orientationchange', this.updateWindowDimensions);
    emitter.addListener('focusMap', this._focusMap);
    emitter.addListener('switchConstraint', (constraint) => this._toggleObstacleLayer(constraint));

    const map = this.reactMap.getMap();
    map.on('load', () => {
      this.setState({ map }, () => {
        this._render3DModels();
        const { obstacles } = this.props;
        if (obstacles) this._renderObstacles(obstacles);
      });
    })
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
    emitter.removeAllListeners();
  }

  updateWindowDimensions = () => {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.map) return;
    if (nextProps.obstacles && nextProps.obstacles !== this.props.obstacles)
      this._renderObstacles(nextProps.obstacles);
    if (nextProps.route && nextProps.route !== this.props.route)
      this._renderRoute(nextProps.route);
    if (nextProps.traversed && nextProps.traversed !== this.props.traversed)
      this._renderTraversedPoints(nextProps.traversed);
  }

  _render3DModels = () => {
    const { map } = this.state;
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
  }

  _renderObstacles = (obstacles) => {
    const { map } = this.state;
    const layer = map.getLayer('obstacles');
    if (layer) {
      map.getSource('obstacles').setData(obstacles);
    } else {
      //add the GeoJSON layer here
      map.addLayer({
        id: 'obstacles',
        type: 'fill',
        source: {
          type: 'geojson',
          data: obstacles
        },
        paint: {
          'fill-color': '#088',
          'fill-opacity': 0.8
        }
      });
    }
  }

  _renderRoute = (route) => {
    const { map } = this.state;
    const layer = map.getLayer('route');
    if (layer) {
      map.getSource('route').setData(route);
    } else {
      //add the GeoJSON layer here
      map.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: route
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#486EF3',
          'line-width': 5
        }
      });
    }
  }

  _renderTraversedPoints = (traversed) => {
    const { map } = this.state;
    const layer = map.getLayer('traversed');
    if (layer) {
      map.getSource('traversed').setData(traversed);
    } else {
      map.addLayer({
        id: 'traversed',
        type: 'circle',
        source: {
          type: 'geojson',
          data: traversed
        },
        paint: {
          // make circles larger as the user zooms from z12 to z22
          'circle-radius': {
            base: 1.75,
            stops: [[12, 2], [22, 180]]
          },
          'circle-color': '#E35F61',
          'circle-opacity': 0.3
        }
      });
      map.moveLayer('traversed', 'route');
    }
  }

  _toggleObstacleLayer = (constraint) => {
    const { map } = this.state;
    map.setLayoutProperty(
      'obstacles',
      'visibility',
      constraint ? 'visible' : 'none'
    );
  }

  _focusMap = () => {
    const viewport = {
      ...this.state.viewport,
      longitude: -122.45,
      latitude: 37.73,
      zoom: 10,
      transitionDuration: 1000,
      transitionInterpolator: new FlyToInterpolator()
    };
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
    const { source, dest } = this.props;
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