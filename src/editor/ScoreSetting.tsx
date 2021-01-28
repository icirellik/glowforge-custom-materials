import React from 'react';
import { IconMinus } from '../icons/IconMinus';
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
  PluginScoreSetting,
} from '../material/materialPlugin';
import {
  InputText,
  InputNumber,
  InputNumberWithCheckbox,
} from './Input';
import type {
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
  const {
    index,
    propValidation,
    removeScore,
    score,
    saveTemporaryState,
    updateScore,
    validationHandler,
  } = props;
  const maxPower = (score.power === 99.99 || score.power === 100);
  return (
    <>
      <div className="form-sub-header">
        <p>
          {`Score ${index + 1}`}
        </p>
        <IconMinus
          className="icon-button-add"
          click={() => {
            removeScore(index);
          }}
          height="16px"
          title={`Remove Score ${index + 1}`}
          width="16px"
        />
      </div>
      <InputText
        label="Name *"
        onBlur={saveTemporaryState}
        onChange={(event) => updateScore(index, 'name', event.target.value)}
        propValidation={propValidation}
        value={score.name}
        validate={validationHandler}
      />
      <InputNumber
        label="Speed * (100 - 500)"
        max="500"
        min="100"
        onBlur={saveTemporaryState}
        onChange={(event) => {
          const normalizedValue = toRealCutSpeed(asInteger(event.target.value));
          updateScore(index, 'speed', normalizedValue);
        }}
        propValidation={propValidation}
        value={toDisplayCutSpeed(score.speed)}
        validate={validationHandler}
      />
      <InputNumberWithCheckbox
        isChecked={maxPower}
        isDisabled={maxPower}
        label="Power * (0 - 100)"
        max="101"
        min="0"
        onBlur={saveTemporaryState}
        onChange={(event) => {
          const normalizedValue = toRealPower(asInteger(event.target.value));
          updateScore(index, 'power', normalizedValue);
        }}
        onChecked={() => {
          const nextMaxPower = !maxPower;
          updateScore(index, 'power', (nextMaxPower) ? 100 : 99);
        }}
        propValidation={propValidation}
        value={toDisplayPower(score.power)}
        validate={validationHandler}
      />
      <InputNumber
        label="Passes"
        min="1"
        onBlur={saveTemporaryState}
        onChange={(event) => {
          const normalizedValue = asInteger(event.target.value);
          updateScore(index, 'passes', normalizedValue);
        }}
        propValidation={propValidation}
        value={score.passes}
      />
      <InputNumber
        label="Focal Offset (mm)"
        onBlur={saveTemporaryState}
        onChange={(event) => {
          const normalizedValue = precisionRound(asFloat(event.target.value), 3);
          updateScore(index, 'focalOffset', normalizedValue);
        }}
        propValidation={propValidation}
        value={score.focalOffset}
      />
    </>
  );
}
