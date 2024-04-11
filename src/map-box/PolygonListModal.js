import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Table from 'react-bootstrap/Table'

const PolygonListModal = props => {
  const [changeData, setChangeData] = useState({})

  const handleChangeInput = (id, value) => {
    setChangeData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Polygon List
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table striped bordered hover>
          <>
            <thead>
              <tr>
                <th>No</th>
                <th>Polygon Name</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {props?.polygonsData?.map((item, index) => (
                <tr key={item._id}>
                  <td>{index + 1}</td>
                  <td>
                    <input
                      value={changeData[item?._id] ?? item?.polygonName}
                      onChange={e =>
                        handleChangeInput(item._id, e.target.value)
                      }
                    />
                  </td>
                  <td>{item?.polygonCoordinates?.[0]?.geometry?.type || ''}</td>
                </tr>
              ))}
            </tbody>
          </>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() => props.onUpdate(Object.entries(changeData))}
          disabled={!Object.keys(changeData).length}
        >
          Update
        </Button>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default PolygonListModal
