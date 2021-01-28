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
import {
  PluginBitmapEngraveSetting,
} from '../material/materialPlugin';
import {
  InputText,
  InputNumber,
  InputNumberWithCheckbox,
} from './Input';
import type {
  RemoveBitmapEngrave,
  UpdateBitmapEngrave,
} from './BitmapEngraveSettings';

interface BitmapEngraveSettingProps {
  bitmap: PluginBitmapEngraveSetting;
  index: number;
  propValidation?: {[key: string]: boolean | null};
  removeBitmapEngrave: RemoveBitmapEngrave;
  saveTemporaryState: () => void;
  updateBitmapEngrave: UpdateBitmapEngrave;
  validationHandler: (id: string, isValid: boolean | null) => void;
}

export default function BitmapEngraveSetting(props: BitmapEngraveSettingProps) {
  const {
    bitmap,
    index,
    propValidation,
    removeBitmapEngrave,
    saveTemporaryState,
    updateBitmapEngrave,
    validationHandler,
  } = props;
  const maxPower = (bitmap.power === 99.99 || bitmap.power === 100);
  return (
    <>
      <div className="form-sub-header">
        <p>
          {`Bitmap Engrave ${index + 1}`}
        </p>
        <IconMinus
          className="icon-button-add"
          click={() => {
            removeBitmapEngrave(index);
          }}
          height="16px"
          title={`Remove Bitmap Engrave ${index + 1}`}
          width="16px"
        />
      </div>
      <InputText
        label="Name *"
        onBlur={saveTemporaryState}
        onChange={(event) => updateBitmapEngrave(index, 'name', event.target.value)}
        propValidation={propValidation}
        value={bitmap.name}
        validate={validationHandler}
      />
      <InputNumber
        label="Speed * (100 - 1400)"
        max="1400"
        min="100"
        onBlur={saveTemporaryState}
        onChange={(event) => {
          const normalizedValue = toRealEngraveSpeed(asInteger(event.target.value));
          updateBitmapEngrave(index, 'speed', normalizedValue);
        }}
        propValidation={propValidation}
        value={toDisplayEngraveSpeed(bitmap.speed)}
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
          updateBitmapEngrave(index, 'power', normalizedValue);
        }}
        onChecked={() => {
          const nextMaxPower = !maxPower;
          updateBitmapEngrave(index, 'power', (nextMaxPower) ? 100 : 99);
        }}
        propValidation={propValidation}
        value={toDisplayPower(bitmap.power)}
        validate={validationHandler}
      />
      <InputNumber
        label="Passes"
        min="1"
        onBlur={saveTemporaryState}
        onChange={(event) => {
          const normalizedValue = asInteger(event.target.value);
          updateBitmapEngrave(index, 'passes', normalizedValue);
        }}
        propValidation={propValidation}
        value={bitmap.passes}
      />
      <InputNumber
        label="Focal Offset (mm)"
        onBlur={saveTemporaryState}
        onChange={(event) => {
          const normalizedValue = precisionRound(asFloat(event.target.value), 3);
          updateBitmapEngrave(index, 'focalOffset', normalizedValue);
        }}
        propValidation={propValidation}
        value={bitmap.focalOffset}
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
        label={`Scan Gap (LPI ${toDisplayLinesPerInch(bitmap.scanGap)}) *`}
        onBlur={saveTemporaryState}
        onChange={(event) => {
          const normalizedValue = asInteger(event.target.value);
          updateBitmapEngrave(index, 'scanGap', normalizedValue);
        }}
        propValidation={propValidation}
        value={bitmap.scanGap}
        validate={validationHandler}
      />
    </>
  );
}
