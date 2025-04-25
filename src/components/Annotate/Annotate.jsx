import { useEffect, useRef, useState } from 'react';
import { Annotorious } from '@recogito/annotorious';
import '@recogito/annotorious/dist/annotorious.min.css';
import SelectorPack from '@recogito/annotorious-selector-pack';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faVectorSquare,
  faDrawPolygon,
  faCrosshairs,
  faDownload,
  faUndo,
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Annotations from './Annotations';

function Annotate({ filedata }) {
  const [isShownAnno, setIsShownAnno] = useState(true);
  const [xyz, setXyz] = useState([]);
  const [selected, setSelected] = useState("btn1");
  const [anno, setAnno] = useState();
  const [tool, setTool] = useState('rect');
  const imgEl = useRef();

  // Store annotations data
  const annotationsRef = useRef({
    objects: [],
    annotations: [],
    exportData: []
  });

  useEffect(() => {
    let annotorious = null;

    if (imgEl.current) {
      annotorious = new Annotorious({
        image: imgEl.current,
        widgets: ['COMMENT']
      });

      SelectorPack(annotorious);

      const handleCreateAnnotation = (annotation) => {
        const annotations = annotorious.getAnnotations();
        const ob = annotation.body.map(b => ({
          purpose: b.purpose,
          value: b.value
        }));

        const selectorType = annotation.target.selector.type;
        const selectorValue = annotation.target.selector.value;

        let temp, shapeVal;
        if (selectorType === 'FragmentSelector') {
          shapeVal = selectorValue.slice(11);
          temp = {
            id: annotation.id,
            type: selectorType,
            value: shapeVal
          };
        } else if (selectorType === 'SvgSelector') {
          if (selectorValue.includes('polygon')) {
            shapeVal = selectorValue.slice(22, -18);
          } else if (selectorValue.includes('ellipse')) {
            const matches = selectorValue.match(/cx="([^"]+)" cy="([^"]+)" rx="([^"]+)" ry="([^"]+)"/);
            if (matches && matches.length === 5) {
              // Validate ellipse values
              if (matches[3] !== "Infinity" && matches[4] !== "Infinity") {
                shapeVal = `${matches[1]},${matches[2]},${matches[3]},${matches[4]}`;
              } else {
                console.warn("Invalid ellipse values - skipping annotation");
                annotorious.removeAnnotation(annotation.id);
                return;
              }
            }
          }
          temp = {
            id: annotation.id,
            type: selectorType,
            value: shapeVal
          };
        }

        if (temp) {
          annotationsRef.current.objects.push(temp);
          annotationsRef.current.annotations = annotations;
          setXyz(annotations);

          annotationsRef.current.exportData.push({
            file_name: filedata.name,
            file_size: filedata.size,
            region_count: annotations.length,
            region_id: annotation.id,
            region_shape_attributes: {
              tool_name: selectorType,
              value: shapeVal
            },
            region_attributes: ob
          });

          // Update region count for all annotations
          annotationsRef.current.exportData.forEach(o => o.region_count = annotations.length);
        }
      };

      const handleUpdateAnnotation = (annotation) => {
        const annotations = annotorious.getAnnotations();
        const index = annotationsRef.current.objects.findIndex(i => i.id === annotation.id);

        const selectorType = annotation.target.selector.type;
        const selectorValue = annotation.target.selector.value;

        if (index !== -1) {
          if (selectorType === 'FragmentSelector') {
            annotationsRef.current.objects[index].value = selectorValue.slice(11);
          } else if (selectorType === 'SvgSelector') {
            if (selectorValue.includes('polygon')) {
              annotationsRef.current.objects[index].value = selectorValue.slice(22, -18);
            } else if (selectorValue.includes('ellipse')) {
              const matches = selectorValue.match(/cx="([^"]+)" cy="([^"]+)" rx="([^"]+)" ry="([^"]+)"/);
              if (matches && matches.length === 5 && matches[3] !== "Infinity" && matches[4] !== "Infinity") {
                annotationsRef.current.objects[index].value = `${matches[1]},${matches[2]},${matches[3]},${matches[4]}`;
              }
            }
          }
        }

        const ob = annotation.body.map(b => ({
          purpose: b.purpose,
          value: b.value
        }));

        const index2 = annotationsRef.current.exportData.findIndex(i => i.region_id === annotation.id);
        if (index2 !== -1) {
          if (selectorType === 'FragmentSelector') {
            annotationsRef.current.exportData[index2].region_shape_attributes.value = selectorValue.slice(11);
          } else if (selectorValue.includes('polygon')) {
            annotationsRef.current.exportData[index2].region_shape_attributes.value = selectorValue.slice(22, -18);
          } else if (selectorValue.includes('ellipse')) {
            const matches = selectorValue.match(/cx="([^"]+)" cy="([^"]+)" rx="([^"]+)" ry="([^"]+)"/);
            if (matches && matches.length === 5 && matches[3] !== "Infinity" && matches[4] !== "Infinity") {
              annotationsRef.current.exportData[index2].region_shape_attributes.value = 
                `${matches[1]},${matches[2]},${matches[3]},${matches[4]}`;
            }
          }

          annotationsRef.current.exportData[index2].region_attributes = ob;
        }

        annotationsRef.current.exportData.forEach(o => o.region_count = annotations.length);
        annotationsRef.current.annotations = annotations;
        setXyz(annotations);
      };

      const handleDeleteAnnotation = (annotation) => {
        const annotations = annotorious.getAnnotations();
        annotationsRef.current.objects = annotationsRef.current.objects.filter(o => o.id !== annotation.id);
        annotationsRef.current.exportData = annotationsRef.current.exportData.filter(o => o.region_id !== annotation.id);

        annotationsRef.current.exportData.forEach(o => o.region_count = annotations.length);
        annotationsRef.current.annotations = annotations;
        setXyz(annotations);
      };

      annotorious.on('createAnnotation', handleCreateAnnotation);
      annotorious.on('updateAnnotation', handleUpdateAnnotation);
      annotorious.on('deleteAnnotation', handleDeleteAnnotation);
    }

    setAnno(annotorious);

    return () => {
      if (annotorious) {
        annotorious.off('createAnnotation');
        annotorious.off('updateAnnotation');
        annotorious.off('deleteAnnotation');
        annotorious.destroy();
      }
    };
  }, [filedata.name, filedata.size]);

  const changeColor = (btn) => setSelected(btn);

  const RectTool = () => {
    if (tool !== 'rect') {
      setTool('rect');
      anno?.setDrawingTool('rect');
      changeColor("btn1");
    }
  };

  const PolygonTool = () => {
    if (tool !== 'polygon') {
      setTool('polygon');
      anno?.setDrawingTool('polygon');
      changeColor("btn2");
    }
  };

  const CircleTool = () => {
    if (tool !== 'ellipse') {
      setTool('ellipse');
      anno?.setDrawingTool('ellipse');
      changeColor("btn3");
    }
  };

  const exportData = () => {
    if (annotationsRef.current.exportData.length === 0) {
      alert("No annotations to export!");
      return;
    }
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(annotationsRef.current.exportData, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "annotations.json";
    link.click();
  };

  const handleHiddenAnno = () => {
    setIsShownAnno(prev => {
      const newState = !prev;
      anno?.setVisible(newState);
      return newState;
    });
  };

  const resetClick = () => {
    if (window.confirm("You will lose all annotations! Do you want to proceed?")) {
      annotationsRef.current = { objects: [], annotations: [], exportData: [] };
      anno?.clearAnnotations();
      setXyz([]);
    }
  };

  return (
    <Container>
      <div className="parent">
        <div className="container mt-5">
          <Row>
            <Col xs={1} md={1}>
              <div className="BtnGroup" role="group" style={{ padding: '0px', marginTop: '50px' }}>
                <button title="Rectangle" className={selected === "btn1" ? "selected" : "notSelected"} onClick={RectTool}>
                  <FontAwesomeIcon icon={faVectorSquare} />
                </button>
                <button title="Polygon" className={selected === "btn2" ? "selected" : "notSelected"} onClick={PolygonTool}>
                  <FontAwesomeIcon icon={faDrawPolygon} />
                </button>
                <button title="Ellipse" className={selected === "btn3" ? "selected" : "notSelected"} onClick={CircleTool}>
                  <FontAwesomeIcon icon={faCrosshairs} />
                </button>
              </div>

              <button id="toggle-btn" title={isShownAnno ? 'Hide Annotations' : 'Show Annotations'} onClick={handleHiddenAnno}>
                <FontAwesomeIcon icon={isShownAnno ? faEye : faEyeSlash} />
              </button>

              <button id="toggle-btn" title="Download Annotations (JSON)" type="button" onClick={exportData}>
                <FontAwesomeIcon icon={faDownload} />
              </button>

              <button id="toggle-btn" title="Reset" onClick={resetClick}>
                <FontAwesomeIcon icon={faUndo} />
              </button>
            </Col>

            <Col xs={11} md={11}>
              <img 
                ref={imgEl} 
                src={URL.createObjectURL(filedata)} 
                alt="To annotate" 
                style={{ maxWidth: '100%', maxHeight: '80vh' }} 
              />
            </Col>
          </Row>
        </div>
        <Annotations data={xyz} />
      </div>
    </Container>
  );
}

export default Annotate;