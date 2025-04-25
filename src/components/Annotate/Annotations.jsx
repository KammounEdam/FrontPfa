import React from 'react';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Badge from 'react-bootstrap/Badge';

function Annotations({ data }) {
  return (
    <div>
      <br />
      <h1>Annotations:</h1>
      <br />
      <Row xs={1} md={3} className="g-4">
        {data.map((item, index) => (
          <Col key={index}>
            <Card id="card" style={{ width: '18rem' }}>
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
                          <Badge key={i} bg="secondary" style={{ margin: '2px' }}>
                            {val}
                          </Badge>
                        ))
                    : item.target.selector.value?.includes('polygon')
                      ? item.target.selector.value?.slice(22, -18)
                          .split(' ')
                          .map((val, i) => (
                            <Badge key={i} bg="secondary" style={{ margin: '2px' }}>
                              {val}
                            </Badge>
                          ))
                      : item.target.selector.value?.includes('ellipse') && (
                          <>
                            {item.target.selector.value.match(/cx="([^"]+)" cy="([^"]+)" rx="([^"]+)" ry="([^"]+)"/)
                              ?.slice(1, 5)
                              .map((val, i) => (
                                <Badge key={i} bg="secondary" style={{ margin: '2px' }}>
                                  {val}
                                </Badge>
                              ))}
                          </>
                        )}
                </Card.Text>
                {item.body.length > 0 && (
                  <Card.Footer>
                    Comments: {item.body.map((b, i) => (
                      <div key={i}>{b.value}</div>
                    ))}
                  </Card.Footer>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default Annotations;