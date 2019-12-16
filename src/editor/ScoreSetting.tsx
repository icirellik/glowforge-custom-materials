import React from 'react';
import IconMinus from '../icons/IconMinus';
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
  PluginScoreSetting,
} from '../material/materialPlugin';
import {
  InputText,
  InputNumber,
  InputNumberWithCheckbox,
} from './Input';
import {
  RemoveScore,
  UpdateScore,
} from './ScoreSettings';

interface ScoreSettingProps {
  index: number;
  propValidation?: {[key: string]: boolean | null};
  removeScore: RemoveScore;
  score: PluginScoreSetting;
  saveTemporaryState: () => void;
  updateScore: UpdateScore;
  validationHandler: (id: string, isValid: boolean | null) => void;
}

export default function ScoreSetting(props: ScoreSettingProps) {
  const maxPower = (props.score.power === 99.99 || props.score.power === 100);
  return (
    <>
      <div className="form-sub-header">
        <p>
          {`Score ${props.index + 1}`}
        </p>
        <IconMinus
          className="icon-button-add"
          click={() => {
            props.removeScore(props.index);
          }}
          height="16px"
          title={`Remove Score ${props.index + 1}`}
          width="16px"
        />
      </div>
      <InputText
        label="Name *"
        onBlur={props.saveTemporaryState}
        onChange={(event) => props.updateScore(props.index, 'name', event.target.value) }
        propValidation={props.propValidation}
        value={props.score.name}
        validate={props.validationHandler}
      />
      <InputNumber
        label="Speed * (100 - 500)"
        max="500"
        min="100"
        onBlur={props.saveTemporaryState}
        onChange={(event) => {
          const normalizedValue = toRealCutSpeed(asInteger(event.target.value));
          props.updateScore(props.index, 'speed', normalizedValue);
        }}
        propValidation={props.propValidation}
        value={toDisplayCutSpeed(props.score.speed)}
        validate={props.validationHandler}
      />
      <InputNumberWithCheckbox
        isChecked={maxPower}
        isDisabled={maxPower}
        label="Power * (0 - 100)"
        max="101"
        min="0"
        onBlur={props.saveTemporaryState}
        onChange={(event) => {
          const normalizedValue = toRealPower(asInteger(event.target.value));
          props.updateScore(props.index, 'power', normalizedValue);
        }}
        onChecked={() => {
          const nextMaxPower = !maxPower;
          props.updateScore(props.index,'power', (nextMaxPower) ? 100 : 99);
        }}
        propValidation={props.propValidation}
        value={toDisplayPower(props.score.power)}
        validate={props.validationHandler}
      />
      <InputNumber
        label="Passes"
        min="1"
        onBlur={props.saveTemporaryState}
        onChange={(event) => {
          const normalizedValue = asInteger(event.target.value);
          props.updateScore(props.index, 'passes', normalizedValue);
        }}
        propValidation={props.propValidation}
        value={props.score.passes}
      />
      <InputNumber
        label="Focal Offset (mm)"
        onBlur={props.saveTemporaryState}
        onChange={(event) => {
          const normalizedValue = precisionRound(asFloat(event.target.value), 3);
          props.updateScore(props.index, 'focalOffset', normalizedValue);
        }}
        propValidation={props.propValidation}
        value={props.score.focalOffset}
      />
    </>
  );
}
