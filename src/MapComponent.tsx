import React, { useRef, useEffect, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Draw } from 'ol/interaction';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Fill, Stroke, Circle } from 'ol/style';

const MapComponent = () => {
    const mapRef = useRef();
    const [map, setMap] = useState(null);
    const [draw, setDraw] = useState(null);
    const [coordinates, setCoordinates] = useState(null);

    useEffect(() => {
        const mapObject = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({
                    source: new OSM()
                }),
                new VectorLayer({
                    source: new VectorSource()
                })
            ],
            view: new View({
                center: [0, 0],
                zoom: 2
            })
        });

        setMap(mapObject);

        mapObject.on('click', handleMapClick);

        return () => {
            mapObject.setTarget(null);
            mapObject.un('click', handleMapClick);
        };
    }, []);

    const handleMapClick = (event) => {
        const clickedCoordinate = event.coordinate;
        const [longitude, latitude] = clickedCoordinate.map(coord => coord.toFixed(6));
        setCoordinates({ latitude, longitude });

        const vectorSource = map.getLayers().item(1).getSource();
        vectorSource.clear();

        const pointFeature = new Feature({
            geometry: new Point(clickedCoordinate)
        });

        const pointStyle = new Style({
            image: new Circle({
                radius: 6,
                fill: new Fill({
                    color: 'red'
                }),
                stroke: new Stroke({
                    color: 'white',
                    width: 2
                })
            })
        });

        pointFeature.setStyle(pointStyle);
        vectorSource.addFeature(pointFeature);
    };

    const addInteractions = (type) => {
        if (draw) {
            map.removeInteraction(draw);
        }
        const drawInteraction = new Draw({
            source: map.getLayers().item(1).getSource(),
            type: type
        });
        map.addInteraction(drawInteraction);
        setDraw(drawInteraction);
    };

    const onDrawPoint = () => {
        addInteractions('Point');
    };

    const onDrawLine = () => {
        addInteractions('LineString');
    };

    const onDrawPolygon = () => {
        addInteractions('Polygon');
    };

    const onClear = () => {
        map.getLayers().item(1).getSource().clear();
        setCoordinates(null);
    };

    return (
        <div>
            <div ref={mapRef} style={{ width: '100%', height: '400px' }}></div>
            <div>
                <button onClick={onDrawPoint}>Draw Point</button>
                <button onClick={onDrawLine}>Draw Line</button>
                <button onClick={onDrawPolygon}>Draw Polygon</button>
                <button onClick={onClear}>Clear</button>
            </div>
            {coordinates && (
                <div style={{ border: '1px solid black', padding: '10px', marginTop: '10px' }}>
                    <h4>Coordinates</h4>
                    <p><strong>Latitude:</strong> {coordinates.latitude}</p>
                    <p><strong>Longitude:</strong> {coordinates.longitude}</p>
                </div>
            )}
        </div>
    );
};

export default MapComponent;
