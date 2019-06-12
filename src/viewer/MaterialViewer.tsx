import React from 'react';
import { ModeCancel, EditorMode } from '../App';
import { PluginMaterial } from '../lib/materialRaw';
import MaterialBitmapEngravesViewer from './MaterialBitmapEngravesViewer';
import MaterialButtonBar from '../MaterialButtonBar';
import MaterialCutViewer from './MaterialCutViewer';
import MaterialScoresViewer from './MaterialScoresViewer';
import MaterialVectorEngravesViewer from './MaterialVectorEngravesViewer';
import QrCodeViewer from './QrCodeViewer';
import './Viewer.css';

export type MaterialViewerProps = {
  editorMode: EditorMode;
  cancelMaterial: ModeCancel;
  material: PluginMaterial;
}

export default function MaterialViewer(props: MaterialViewerProps) {
  const {
    editorMode,
    material,
  } = props;

  if (editorMode !== 'SELECTED') {
    return null;
  }

  return (
    <div className="viewer__column">
      <div className="viewer__headerRow">
        <p>General Settings</p>
      </div>
      <div className="viewer__row">
        <p className="viewer__label">Thickness Name</p>
        <p className="viewer__value">{material.thickName}</p>
      </div>
      <div className="viewer__row">
        <p className="viewer__label">Material Name:</p>
        <p className="viewer__value">{material.name}</p>
      </div>
      <div className="viewer__row">
        <p className="viewer__label">Thickness (mm)</p>
        <p className="viewer__value">{material.thickness}</p>
      </div>

      <MaterialCutViewer cut={material.cut} />
      <MaterialScoresViewer scores={material.scores} />
      <MaterialVectorEngravesViewer vectors={material.vectors} />
      <MaterialBitmapEngravesViewer bitmaps={material.bitmaps} />

      <QrCodeViewer material={material} />

      <MaterialButtonBar
        editorMode={props.editorMode}
        cancelMaterial={props.cancelMaterial}
      />
    </div>
  );
}
