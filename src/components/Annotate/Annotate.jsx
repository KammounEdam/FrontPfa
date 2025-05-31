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
  faEyeSlash,
  faSave
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Annotations from './Annotations';
import './Annotate.css';


function Annotate({ filedata }) {
  const Rectangle = <FontAwesomeIcon icon={faVectorSquare} />
  const Polygon = <FontAwesomeIcon icon={faDrawPolygon} />
  const Download = <FontAwesomeIcon icon={faDownload} />
  const RESET = <FontAwesomeIcon icon={faUndo} />
  const ShowEye = <FontAwesomeIcon icon={faEye} />
  const HideEye = <FontAwesomeIcon icon={faEyeSlash} />
  const Ellipse = <FontAwesomeIcon icon={faCrosshairs} />

  const [isShownAnno, setIsShownAnno] = useState(true);
  const [xyz, setXyz] = useState([]);
  const [selected, setSelected] = useState("btn1");
const annoRef = useRef(null);
  const [tool, setTool] = useState('rect');
  const [isSaving, setIsSaving] = useState(false);
  const imgEl = useRef();
  const [ anno, setAnno ] = useState();



  // Store annotations data
  const annotationsRef = useRef({
    objects: [],
    annotations: [],
    exportData: []
  });

  // Helper function to safely parse JSON
  const safeJsonParse = (str) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.error("JSON parse error:", e);
      return null;
    }
  };

  // Save annotations to backend
  const saveAnnotationsToBackend = async () => {
    if (!filedata?.id) {
      console.error("Cannot save - no image ID in filedata:", filedata);
      alert("No image selected - cannot save annotations");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        annotations: annotationsRef.current.annotations,
        objects: annotationsRef.current.objects,
        exportData: annotationsRef.current.exportData
      };

      const response = await axios.patch(
        `https://localhost:7162/api/ImageMedicale/${filedata.id}/annotate-graphics`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      console.log("Annotations saved successfully:", response.data);
      alert("Annotations saved successfully!");
    } catch (error) {
      console.error("Error saving annotations:", error);
      if (error.response) {
        console.error("Server response:", error.response.data);
        alert(`Failed to save annotations: ${error.response.data?.message || error.response.statusText}`);
      } else {
        alert("Failed to save annotations: Network error");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Load existing annotations
  const loadExistingAnnotations = async () => {
    try {
      if (!filedata?.id) {
        console.log("No image ID in filedata - skipping annotation load");
        return;
      }

      const response = await axios.get(
        `https://localhost:7162/api/ImageMedicale/${filedata.id}`,
        {
          headers: { 'Accept': 'application/json' },
          validateStatus: (status) => status < 500
        }
      );

      if (response.status === 404) {
        console.log("No existing annotations found for image", filedata.id);
        return;
      }

      if (response.data?.annotationGraphics) {
        const existingData = safeJsonParse(response.data.annotationGraphics);
        if (existingData) {
          console.log("Loaded existing annotations:", existingData);
          if (anno) {
            anno.setAnnotations(existingData.annotations || []);
          }
          annotationsRef.current = {
            objects: existingData.objects || [],
            annotations: existingData.annotations || [],
            exportData: existingData.exportData || []
          };
          setXyz(existingData.annotations || []);
        }
      }
    } catch (error) {
      console.error("Error loading annotations:", error);
      if (error.response) {
        console.error("Server response:", error.response.data);
      }
    }
  };

 useEffect(() => {
  let annotorious = null;

  if (imgEl.current) {
    annotorious = new Annotorious({
      image: imgEl.current,
      widgets: ['COMMENT']
    });

    SelectorPack(annotorious);

    const parseEllipse = (value) => {
      const matches = value.match(/cx="([^"]+)" cy="([^"]+)" rx="([^"]+)" ry="([^"]+)"/);
      if (matches && matches.length === 5) {
        const [_, cx, cy, rx, ry] = matches;
        if ([cx, cy, rx, ry].every(v => !isNaN(v) && isFinite(v))) {
          return `${cx},${cy},${rx},${ry}`;
        }
      }
      return null;
    };

    const parsePolygon = (value) => {
      const match = value.match(/<polygon[^>]*points="([^"]+)"[^>]*>/);
      return match ? match[1] : null;
    };

    const handleCreateAnnotation = (annotation) => {
      const annotations = annotorious.getAnnotations();
      const ob = annotation.body.map(b => ({
        purpose: b.purpose,
        value: b.value
      }));

      const { type: selectorType, value: selectorValue } = annotation.target.selector;

      let temp = null;
      let shapeVal = null;

      if (selectorType === 'FragmentSelector') {
        shapeVal = selectorValue.slice(11);
        temp = { id: annotation.id, type: selectorType, value: shapeVal };
      } else if (selectorType === 'SvgSelector') {
        if (selectorValue.includes('polygon')) {
          shapeVal = parsePolygon(selectorValue);
        } else if (selectorValue.includes('ellipse')) {
          shapeVal = parseEllipse(selectorValue);
          if (!shapeVal) {
            console.warn("Invalid ellipse values - skipping annotation");
            annotorious.removeAnnotation(annotation.id);
            return;
          }
        }
        if (shapeVal) {
          temp = { id: annotation.id, type: selectorType, value: shapeVal };
        }
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

        annotationsRef.current.exportData.forEach(o => o.region_count = annotations.length);
      }
    };

    const handleUpdateAnnotation = (annotation) => {
      const annotations = annotorious.getAnnotations();
      const index = annotationsRef.current.objects.findIndex(i => i.id === annotation.id);
      const { type: selectorType, value: selectorValue } = annotation.target.selector;

      let shapeVal = null;
      if (selectorType === 'FragmentSelector') {
        shapeVal = selectorValue.slice(11);
      } else if (selectorType === 'SvgSelector') {
        if (selectorValue.includes('polygon')) {
          shapeVal = parsePolygon(selectorValue);
        } else if (selectorValue.includes('ellipse')) {
          shapeVal = parseEllipse(selectorValue);
        }
      }

      if (shapeVal && index !== -1) {
        annotationsRef.current.objects[index].value = shapeVal;
      }

      const ob = annotation.body.map(b => ({
        purpose: b.purpose,
        value: b.value
      }));

      const index2 = annotationsRef.current.exportData.findIndex(i => i.region_id === annotation.id);
      if (index2 !== -1 && shapeVal) {
        annotationsRef.current.exportData[index2].region_shape_attributes.value = shapeVal;
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

   annoRef.current = annotorious;
    loadExistingAnnotations();
  }

return () => {
  if (annoRef.current) {
    annoRef.current.off('createAnnotation');
    annoRef.current.off('updateAnnotation');
    annoRef.current.off('deleteAnnotation');
    annoRef.current.destroy();
    annoRef.current = null;
  }
};

}, [filedata.id, filedata.name, filedata.size]);


  const changeColor = (btn) => {
    setSelected(btn);
  };


const RectTool = () => {
  if (tool !== 'rect' && annoRef.current) {
    setTool('rect');
    annoRef.current.setDrawingTool('rect');
    changeColor("btn1");
  }
};

const PolygonTool = () => {
  if (tool !== 'polygon' && annoRef.current) {
    setTool('polygon');
    annoRef.current.setDrawingTool('polygon');
    changeColor("btn2");
  }
};

const CircleTool = () => {
  if (tool !== 'ellipse' && annoRef.current) {
    setTool('ellipse');
    annoRef.current.setDrawingTool('ellipse');
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
  if (annoRef.current) {
    annoRef.current.setVisible(!isShownAnno);
    setIsShownAnno(!isShownAnno);
  } else {
    console.warn("Annotorious instance not ready.");
  }
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
              <div className="BtnGroup" role="group">
                <button
                  className={selected === "btn1" ? "btn btn-primary" : "btn btn-outline-primary"}
                  onClick={RectTool}
                  title="Rectangle Tool"
                >
                  {Rectangle}
                </button>
                <button
                  className={selected === "btn2" ? "btn btn-primary" : "btn btn-outline-primary"}
                  onClick={PolygonTool}
                  title="Polygon Tool"
                >
                  {Polygon}
                </button>
                <button
                  className={selected === "btn3" ? "btn btn-primary" : "btn btn-outline-primary"}
                  onClick={CircleTool}
                  title="Ellipse Tool"
                >
                  {Ellipse}
                </button>
              </div>

              <button
                id="toggle-btn"
                title={isShownAnno === true ? 'Hide Annotations' : 'Show Annotations'}
                onClick={handleHiddenAnno}
              >
                {isShownAnno === true ?
                  <i>{ShowEye}</i>
                  : <i>{HideEye}</i>
                }
              </button>

              <button
                id="toggle-btn"
                title="Download Annotations (JSON)"
                type="button"
                onClick={exportData}
              >
                <FontAwesomeIcon icon={faDownload} />
              </button>

              <button
                id="toggle-btn"
                title="Save Annotations"
                onClick={saveAnnotationsToBackend}
                disabled={isSaving || !filedata?.id}
              >
                <FontAwesomeIcon icon={faSave} />
                {isSaving && <span> Saving...</span>}
              </button>

              <button
                id="toggle-btn"
                title="Reset Annotations"
                onClick={resetClick}
              >
                <FontAwesomeIcon icon={faUndo} />
              </button>
            </Col>

            <Col xs={11} md={11}>
              <div className="image-container">
                <img
                  ref={imgEl}
                  src={filedata.url}
                  alt="Medical to annotate"
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
            </Col>
          </Row>
        </div>

        <div className="annotations-section">
          <Annotations data={xyz} />
        </div>
      </div>
    </Container>
  );
}

export default Annotate;