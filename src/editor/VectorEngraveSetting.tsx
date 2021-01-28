import React from 'react';
import { IconMinus } from '../icons/IconMinus';
import {
  asFloat,
  asInteger,
  precisionRound,
} from '../lib/utils';
import {
  toDisplayEngraveSpeed,
  toDisplayLinesPerInch,
  toDisplayPower,
  toRealEngraveSpeed,
  toRealPower,
} from '../lib/glowforgeUnits';
import type {
  PluginVectorEngraveSetting,
} from '../material/materialPlugin';
import {
  InputText,
  InputNumber,
  InputNumberWithCheckbox,
} from './Input';
import type {
  RemoveVectorEngrave,
  UpdateVectorEngrave,
} from './VectorEngraveSettings';

interface VectorEngraveSettingProps {
  index: number;
  propValidation?: {[key: string]: boolean | null};
  removeVectorEngrave: RemoveVectorEngrave;
  saveTemporaryState: () => void;
  updateVectorEngrave: UpdateVectorEngrave;
  vector: PluginVectorEngraveSetting;
  validationHandler: (id: string, isValid: boolean | null) => void;
}

export default function VectorEngraveSetting(props: VectorEngraveSettingProps) {
  const {
    index,
    propValidation,
    removeVectorEngrave,
    saveTemporaryState,
    updateVectorEngrave,
    vector,
    validationHandler,
  } = props;
  const maxPower = (vector.power === 99.99 || vector.power === 100);
  return (
    <>
      <div className="form-sub-header">
        <p>
          {`Vector Engrave ${index + 1}`}
        </p>
        <IconMinus
          className="icon-button-add"
          click={() => {
            removeVectorEngrave(index);
          }}
          height="16px"
          title={`Remove Vector Engrave ${index + 1}`}
          width="16px"
        />
      </div>
      <InputText
        label="Name *"
        onBlur={saveTemporaryState}
        onChange={(event) => updateVectorEngrave(index, 'name', event.target.value)}
        propValidation={propValidation}
        value={vector.name}
        validate={validationHandler}
      />
      <InputNumber
        label="Speed * (100 - 1400)"
        max="1400"
        min="100"
        onBlur={saveTemporaryState}
        onChange={(event) => {
          const normalizedValue = toRealEngraveSpeed(asInteger(event.target.value));
          updateVectorEngrave(index, 'speed', normalizedValue);
        }}
        propValidation={propValidation}
        value={toDisplayEngraveSpeed(vector.speed)}
        validate={validationHandler}
      />
      <InputNumberWithCheckbox
        isChecked={maxPower}
        isDisabled={maxPower}
        label="Power * (0 - 100)"
        max="101"
        min="0"
        onBlur={saveTemporaryState}
        onChange={(event) => updateVectorEngrave(index, 'power', toRealPower(asInteger(event.target.value)))}
        onChecked={() => {
          const nextMaxPower = !maxPower;
          updateVectorEngrave(index, 'power', (nextMaxPower) ? 100 : 99);
        }}
        propValidation={propValidation}
        value={toDisplayPower(vector.power)}
        validate={validationHandler}
      />
      <InputNumber
        label="Passes"
        min="1"
        onBlur={saveTemporaryState}
        onChange={(event) => {
          const normalizedValue = asInteger(event.target.value);
          updateVectorEngrave(index, 'passes', normalizedValue);
        }}
        propValidation={propValidation}
        value={vector.passes}
      />
      <InputNumber
        label="Focal Offset (mm)"
        onBlur={saveTemporaryState}
        onChange={(event) => {
          const normalizedValue = precisionRound(asFloat(event.target.value), 3);
          updateVectorEngrave(index, 'focalOffset', normalizedValue);
        }}
        propValidation={propValidation}
        value={vector.focalOffset}
      />
      <InputNumber
        help={'Scan Gap mapping to Glowforge UI \n '
          + '1 = 1355 LPI \n '
          + '2 = 675 LPI \n '
          + '3 = 450 LPI \n '
          + '4 = 340 LPI \n '
          + '5 = 270 LPI \n '
          + '6 = 225 LPI \n '
          + '7 = 195 LPI \n '
          + '8 = 170 LPI \n '
          + '11 = 125 LPI \n '
          + '18 = 75 LPI \n '
          + '39 = 35 LPI \n '
          + '136 = 10 LPI'}
        label={`Scan Gap (LPI ${toDisplayLinesPerInch(vector.scanGap)}) *`}
        onBlur={saveTemporaryState}
        onChange={(event) => {
          const normalizedValue = asInteger(event.target.value);
          updateVectorEngrave(index, 'scanGap', normalizedValue);
        }}
        propValidation={propValidation}
        value={vector.scanGap}
        validate={validationHandler}
      />
    </>
  );
}
