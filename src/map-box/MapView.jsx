import React, { useEffect, useMemo, useState } from 'react'
import ReactMapboxGl, { GeoJSONLayer, Layer, Source } from 'react-mapbox-gl'
import turf from 'turf'
import DrawControl from 'react-mapbox-gl-draw'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import PolygonListModal from './PolygonListModal'
import Button from 'react-bootstrap/esm/Button'
import Alert from 'react-bootstrap/esm/Alert'

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN
const API_URL = process.env.REACT_APP_API_URL

const Map = ReactMapboxGl({
  accessToken: MAPBOX_TOKEN
})
const layerStyle = {
  id: 'maine',
  type: 'fill',
  source: 'maine', // reference the data source
  layout: {},
  paint: {
    'fill-color': '#0080ff', // blue color fill
    'fill-opacity': 0.5
  }
}

const layerOutline = {
  id: 'outline',
  type: 'line',
  source: 'maine',
  layout: {},
  paint: {
    'line-color': '#000',
    'line-width': 3
  }
}

const MapView = () => {
  const [polygonsData, setPolygonsData] = useState([{}])

  const [formData, setFormData] = useState({
    polygonName: '',
    polygonCoordinates: []
  })
  const [modalShow, setModalShow] = useState(false)
  const [showAlert, setShowAlert] = useState(false) // State for alert visibility

  // Function to fetch polygons data
  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/polygons`)
      if (!response.ok) {
        throw new Error('Failed to fetch polygons')
      }
      const data = await response.json()
      setPolygonsData(Array.isArray(data?.data) ? data?.data : [])
    } catch (error) {
      console.error('Error fetching polygons:', error)
    }
  }
  const geojsonData = useMemo(
    () => ({
      type: 'FeatureCollection',
      features: polygonsData.map(polygon => ({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            polygon?.polygonCoordinates?.[0]?.geometry?.coordinates?.[0]
          ]
        }
      }))
    }),
    [polygonsData]
  )

  // Function to post polygon data
  const postData = async payload => {
    try {
      const response = await fetch(`${API_URL}/polygons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      if (!response.ok) {
        throw new Error('Failed to post polygon')
      }
      setShowAlert(true)
      fetchData()
    } catch (error) {
      console.error('Error posting polygon:', error)
    }
  }

  const updateName = async payload => {
    try {
      const response = await fetch(`${API_URL}/polygons/name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      if (!response.ok) {
        throw new Error('Failed to post name')
      }
      setShowAlert(true)
      fetchData()
    } catch (error) {
      console.error('Error posting name:', error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const onDrawCreate = ({ features }) => {
    setFormData(prevData => ({ ...prevData, polygonCoordinates: features }))
  }

  const onDrawUpdate = ({ features }) => {
    setFormData(prevData => ({ ...prevData, polygonCoordinates: features }))
  }

  const onDrawDelete = ({ features }) => {
    console.log(features)
  }

  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData(prevData => ({ ...prevData, [name]: value }))
  }

  const handleFormSubmit = e => {
    e.preventDefault()
    postData(formData)
    setFormData(formData)
  }

  const geojsonStyles = {
    lineLayout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    linePaint: {
      'line-color': 'rgba(0,0,255,0.5)',
      'line-width': 4,
      'line-opacity': 1
    },
    symbolLayout: {
      'text-field': '{text}',
      'symbol-placement': 'line',
      'text-rotation-alignment': 'map',
      'text-offset': [-0.6, -0.6],
      'text-size': {
        base: 1,
        stops: [
          [9, 9],
          [14, 12]
        ]
      }
    },
    symbolPaint: {
      'text-color': 'rgba(0, 0, 0, 1)',
      'text-halo-color': 'rgba(255, 255, 255, 1)',
      'text-halo-width': 2
    }
  }

  const turfPolygons = geojsonData.features
    .map(feature => feature?.geometry?.coordinates)
    .filter(coordinates => coordinates?.[0]?.length >= 4)
    .map(coordinates => turf.polygon(coordinates))

  return (
    <div>
      {showAlert && (
        <Alert
          variant="success"
          onClose={() => setShowAlert(false)}
          dismissible
        >
          Polygon added successfully!
        </Alert>
      )}
      <Map
        style="mapbox://styles/mapbox/streets-v9" // eslint-disable-line
        center={[-95.358421, 29.749907]} //Houston, Texas, United States
        containerStyle={{
          height: '650px',
          width: '100vw'
        }}
      >
        {turfPolygons.map(polygon => (
          <GeoJSONLayer {...geojsonStyles} data={polygon}></GeoJSONLayer>
        ))}

        <DrawControl
          onDrawCreate={onDrawCreate}
          onDrawUpdate={onDrawUpdate}
          onDrawDelete={onDrawDelete}
        />
        {/* {polygonsData?.map((polygon) => (
          <Layer
            key={polygon.id}
            type="fill"
            id={`polygon-${polygon.id}`}
            paint={{ "fill-color": "#f00", "fill-opacity": 0.5 }}
          >
            <Feature coordinates={polygon.geometry.coordinates} />
          </Layer>
        ))} */}
      </Map>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          margin: '10px'
        }}
      >
        <form onSubmit={handleFormSubmit}>
          <input
            placeholder="Enter Polygon Name"
            name="polygonName"
            type="text"
            required
            value={formData.polygonName}
            onChange={handleInputChange}
          ></input>
          <Button
            style={{ marginLeft: '20px' }}
            type="submit"
            variant="success"
            disabled={!formData.polygonCoordinates || !formData.polygonName}
          >
            Add
          </Button>
        </form>
        <Button variant="dark" onClick={() => setModalShow(true)}>
          View Polygon List
        </Button>
      </div>

      <PolygonListModal
        show={modalShow}
        onHide={() => setModalShow(false)}
        onUpdate={updateName}
        polygonsData={polygonsData}
      />
    </div>
  )
}

export default MapView
