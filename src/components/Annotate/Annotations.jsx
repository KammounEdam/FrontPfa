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
                  {item.target.selector.type === 'FragmentSelector' ? (
                    <>Type: Rectangle (x, y, width, height)</>
                  ) : item.target.selector.value?.includes('polygon') ? (
                    <>Type: Polygone (points)</>
                  ) : item.target.selector.value?.includes('ellipse') ? (
                    <>Type: Ellipse (cx, cy, rx, ry)</>
                  ) : (
                    <>Type: {item.target.selector.type}</>
                  )}
                </Card.Subtitle>
                <Card.Text>
                  {item.target.selector.type === 'FragmentSelector' ? (
                    // Rectangle
                    <>
                      <div style={{ marginBottom: '5px' }}>Format: x,y,width,height</div>
                      {item.target.selector.value?.slice(11)
                        .split(',')
                        .map((val, i) => {
                          const labels = ['x', 'y', 'width', 'height'];
                          return (
                            <Badge key={i} bg="primary" style={{ margin: '2px' }}>
                              {labels[i]}: {val}
                            </Badge>
                          );
                        })}
                    </>
                  ) : item.target.selector.value?.includes('polygon') ? (
                    // Polygone
                    <>
                      <div style={{ marginBottom: '5px' }}>Points du polygone:</div>
                      {(() => {
                        const pointsMatch = item.target.selector.value.match(/points="([^"]+)"/);
                        const pointsStr = pointsMatch && pointsMatch.length > 1
                          ? pointsMatch[1]
                          : item.target.selector.value?.slice(22, -18);

                        return pointsStr.split(' ').map((val, i) => (
                          <Badge key={i} bg="info" style={{ margin: '2px' }}>
                            Point {i+1}: {val}
                          </Badge>
                        ));
                      })()}
                    </>
                  ) : item.target.selector.value?.includes('ellipse') ? (
                    // Ellipse
                    <>
                      <div style={{ marginBottom: '5px' }}>Paramètres de l'ellipse:</div>
                      {(() => {
                        const matches = item.target.selector.value.match(/cx="([^"]+)" cy="([^"]+)" rx="([^"]+)" ry="([^"]+)"/);
                        if (matches && matches.length === 5) {
                          const labels = ['centre x', 'centre y', 'rayon x', 'rayon y'];
                          return matches.slice(1, 5).map((val, i) => (
                            <Badge key={i} bg="warning" style={{ margin: '2px' }}>
                              {labels[i]}: {val}
                            </Badge>
                          ));
                        }
                        return null;
                      })()}
                    </>
                  ) : (
                    // Type inconnu
                    <Badge bg="danger">Format non reconnu</Badge>
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