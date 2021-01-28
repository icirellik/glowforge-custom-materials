import React from 'react';
import {
  asFloat,
  asInteger,
  precisionRound,
} from '../lib/utils';
import {
  toDisplayCutSpeed,
  toDisplayPower,
  toRealCutSpeed,
  toRealPower,
} from '../lib/glowforgeUnits';
import type {
  PluginCutSetting,
} from '../material/materialPlugin';
import {
  InputNumber,
  InputNumberWithCheckbox,
} from './Input';

export type UpdateCut = <K extends keyof PluginCutSetting>(prop: K, value: PluginCutSetting[K]) => void;

interface CutSettingsProps {
  cut: PluginCutSetting;
  propValidation?: {[key: string]: boolean | null};
  saveTemporaryState: () => void;
  updateCut: UpdateCut;
  validationHandler: (id: string, isValid: boolean | null) => void;
}

export default function CutSettings(props: CutSettingsProps) {
  const {
    cut,
    propValidation,
    saveTemporaryState,
    updateCut,
    validationHandler,
  } = props;
  const maxPower = (cut.power === 99.99 || cut.power === 100);
  return (
    <>
      <div className="form-header">
        <p>Cut Settings</p>
      </div>
      <InputNumber
        label="Speed * (100 - 500)"
        max="500"
        min="100"
        onBlur={saveTemporaryState}
        onChange={(event) => updateCut('speed', toRealCutSpeed(asInteger(event.target.value)))}
        propValidation={propValidation}
        value={toDisplayCutSpeed(cut.speed)}
        validate={validationHandler}
      />
      <InputNumberWithCheckbox
        isChecked={maxPower}
        isDisabled={maxPower}
        label="Power * (0 - 100)"
        max="101"
        min="0"
        onBlur={saveTemporaryState}
        onChange={(event) => updateCut('power', toRealPower(asInteger(event.target.value)))}
        onChecked={() => {
          const nextMaxPower = !maxPower;
          updateCut('power', (nextMaxPower) ? 100 : 99);
        }}
        propValidation={propValidation}
        value={toDisplayPower(cut.power)}
        validate={validationHandler}
      />
      <InputNumber
        label="Passes"
        min="1"
        onBlur={saveTemporaryState}
        onChange={(event) => updateCut('passes', asInteger(event.target.value))}
        propValidation={propValidation}
        value={cut.passes}
      />
      <InputNumber
        label="Focal Offset (mm)"
        onBlur={saveTemporaryState}
        onChange={(event) => updateCut('focalOffset', precisionRound(asFloat(event.target.value), 3))}
        propValidation={propValidation}
        value={cut.focalOffset}
      />
    </>
  );
}
