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
import {
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
  const maxPower = (props.cut.power === 99.99 || props.cut.power === 100);
  return (
    <>
      <div className="form-header">
        <p>Cut Settings</p>
      </div>
      <InputNumber
        label="Speed * (100 - 500)"
        max="500"
        min="100"
        onBlur={props.saveTemporaryState}
        onChange={(event) => props.updateCut('speed', toRealCutSpeed(asInteger(event.target.value))) }
        propValidation={props.propValidation}
        value={toDisplayCutSpeed(props.cut.speed)}
        validate={props.validationHandler}
      />
      <InputNumberWithCheckbox
        isChecked={maxPower}
        isDisabled={maxPower}
        label="Power * (0 - 100)"
        max="101"
        min="0"
        onBlur={props.saveTemporaryState}
        onChange={(event) => props.updateCut('power', toRealPower(asInteger(event.target.value))) }
        onChecked={() => {
          const nextMaxPower = !maxPower;
          props.updateCut('power', (nextMaxPower) ? 100 : 99);
        }}
        propValidation={props.propValidation}
        value={toDisplayPower(props.cut.power)}
        validate={props.validationHandler}
      />
      <InputNumber
        label="Passes"
        min="1"
        onBlur={props.saveTemporaryState}
        onChange={(event) => props.updateCut('passes', asInteger(event.target.value)) }
        propValidation={props.propValidation}
        value={props.cut.passes}
      />
      <InputNumber
        label="Focal Offset (mm)"
        onBlur={props.saveTemporaryState}
        onChange={(event) => props.updateCut('focalOffset', precisionRound(asFloat(event.target.value), 3)) }
        propValidation={props.propValidation}
        value={props.cut.focalOffset}
      />
    </>
  );
}
