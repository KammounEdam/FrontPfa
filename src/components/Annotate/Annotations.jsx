import React from 'react';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Badge from 'react-bootstrap/Badge';
import '../Annotate/Annotate.css';

function Annotations({ data }) {
  return (
    <div>
      <h1>Annotations:</h1>
      <Row xs={1} md={3} className="g-4">
        {data.length === 0 ? (
          <Col>
            <div className="text-muted">No annotations yet. Use the tools on the left to create annotations.</div>
          </Col>
        ) : (
          data.map((item, index) => (
            <Col key={index}>
              <Card id="card">
                <Card.Body>
                  <Card.Title>ID: {item.id}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    Type: {item.target.selector.type}
                    {item.target.selector.type === 'FragmentSelector' ? (
                      <p>x y h w</p>
                    ) : (
                      <p>Coordinates</p>
                    )}
                  </Card.Subtitle>
                  <Card.Text>
                    {item.target.selector.type === 'FragmentSelector'
                      ? item.target.selector.value?.slice(11)
                          .split(',')
                          .map((val, i) => (
                            <Badge key={i} bg="primary" style={{ margin: '2px' }}>
                              {val}
                            </Badge>
                          ))
                      : item.target.selector.value?.includes('polygon')
                        ? item.target.selector.value?.slice(22, -18)
                            .split(' ')
                            .map((val, i) => (
                              <Badge key={i} bg="primary" style={{ margin: '2px' }}>
                                {val}
                              </Badge>
                            ))
                        : item.target.selector.value?.includes('ellipse') && (
                            <>
                              {item.target.selector.value.match(/cx="([^"]+)" cy="([^"]+)" rx="([^"]+)" ry="([^"]+)"/)
                                ?.slice(1, 5)
                                .map((val, i) => (
                                  <Badge key={i} bg="primary" style={{ margin: '2px' }}>
                                    {val}
                                  </Badge>
                                ))}
                            </>
                          )}
                  </Card.Text>
                  {item.body.length > 0 && (
                    <Card.Footer className="bg-light">
                      <strong>Comments:</strong>
                      {item.body.map((b, i) => (
                        <div key={i} className="mt-1 p-2 bg-white rounded">{b.value}</div>
                      ))}
                    </Card.Footer>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </div>
  );
}

export default Annotations;