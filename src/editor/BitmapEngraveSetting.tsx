import React from 'react';
import IconMinus from '../icons/IconMinus';
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
import {
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
  const maxPower = (props.bitmap.power === 99.99 || props.bitmap.power === 100);
  return (
    <>
      <div className="form-sub-header">
        <p>
          {`Bitmap Engrave ${props.index + 1}`}
        </p>
        <IconMinus
          className="icon-button-add"
          click={() => {
            props.removeBitmapEngrave(props.index);
          }}
          height="16px"
          title={`Remove Bitmap Engrave ${props.index + 1}`}
          width="16px"
        />
      </div>
      <InputText
        label="Name *"
        onBlur={props.saveTemporaryState}
        onChange={(event) => props.updateBitmapEngrave(props.index, 'name', event.target.value) }
        propValidation={props.propValidation}
        value={props.bitmap.name}
        validate={props.validationHandler}
      />
      <InputNumber
        label="Speed * (100 - 1400)"
        max="1400"
        min="100"
        onBlur={props.saveTemporaryState}
        onChange={(event) => {
          const normalizedValue = toRealEngraveSpeed(asInteger(event.target.value));
          props.updateBitmapEngrave(props.index, 'speed', normalizedValue);
        }}
        propValidation={props.propValidation}
        value={toDisplayEngraveSpeed(props.bitmap.speed)}
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
          props.updateBitmapEngrave(props.index, 'power', normalizedValue);
        }}
        onChecked={() => {
          const nextMaxPower = !maxPower;
          props.updateBitmapEngrave(props.index, 'power', (nextMaxPower) ? 100 : 99);
        }}
        propValidation={props.propValidation}
        value={toDisplayPower(props.bitmap.power)}
        validate={props.validationHandler}
      />
      <InputNumber
        label="Passes"
        min="1"
        onBlur={props.saveTemporaryState}
        onChange={(event) => {
          const normalizedValue = asInteger(event.target.value);
          props.updateBitmapEngrave(props.index, 'passes', normalizedValue);
        }}
        propValidation={props.propValidation}
        value={props.bitmap.passes}
      />
      <InputNumber
        label="Focal Offset (mm)"
        onBlur={props.saveTemporaryState}
        onChange={(event) => {
          const normalizedValue = precisionRound(asFloat(event.target.value), 3);
          props.updateBitmapEngrave(props.index, 'focalOffset', normalizedValue);
        }}
        propValidation={props.propValidation}
        value={props.bitmap.focalOffset}
      />
      <InputNumber
        help={"Scan Gap mapping to Glowforge UI \n " +
          "1 = 1355 LPI \n " +
          "2 = 675 LPI \n " +
          "3 = 450 LPI \n " +
          "4 = 340 LPI \n " +
          "5 = 270 LPI \n " +
          "6 = 225 LPI \n " +
          "7 = 195 LPI \n " +
          "8 = 170 LPI \n " +
          "11 = 125 LPI \n " +
          "18 = 75 LPI \n " +
          "39 = 35 LPI \n " +
          "136 = 10 LPI"
        }
        label={`Scan Gap (LPI ${toDisplayLinesPerInch(props.bitmap.scanGap)}) *`}
        onBlur={props.saveTemporaryState}
        onChange={(event) => {
          const normalizedValue = asInteger(event.target.value);
          props.updateBitmapEngrave(props.index, 'scanGap', normalizedValue);
        }}
        propValidation={props.propValidation}
        value={props.bitmap.scanGap}
        validate={props.validationHandler}
      />
    </>
  );
}
