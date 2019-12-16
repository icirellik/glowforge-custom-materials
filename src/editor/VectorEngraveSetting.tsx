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
  PluginVectorEngraveSetting,
} from '../material/materialPlugin';
import {
  InputText,
  InputNumber,
  InputNumberWithCheckbox,
} from './Input';
import {
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
  const maxPower = (props.vector.power === 99.99 || props.vector.power === 100);
  return (
    <>
      <div className="form-sub-header">
        <p>
          {`Vector Engrave ${props.index + 1}`}
        </p>
        <IconMinus
          className="icon-button-add"
          click={() => {
            props.removeVectorEngrave(props.index);
          }}
          height="16px"
          title={`Remove Vector Engrave ${props.index + 1}`}
          width="16px"
        />
      </div>
      <InputText
        label="Name *"
        onBlur={props.saveTemporaryState}
        onChange={(event) => props.updateVectorEngrave(props.index, 'name', event.target.value) }
        propValidation={props.propValidation}
        value={props.vector.name}
        validate={props.validationHandler}
      />
      <InputNumber
        label="Speed * (100 - 1400)"
        max="1400"
        min="100"
        onBlur={props.saveTemporaryState}
        onChange={(event) => {
          const normalizedValue = toRealEngraveSpeed(asInteger(event.target.value));
          props.updateVectorEngrave(props.index, 'speed', normalizedValue);
        }}
        propValidation={props.propValidation}
        value={toDisplayEngraveSpeed(props.vector.speed)}
        validate={props.validationHandler}
      />
      <InputNumberWithCheckbox
        isChecked={maxPower}
        isDisabled={maxPower}
        label="Power * (0 - 100)"
        max="101"
        min="0"
        onBlur={props.saveTemporaryState}
        onChange={(event) => props.updateVectorEngrave(props.index, 'power', toRealPower(asInteger(event.target.value))) }
        onChecked={() => {
          const nextMaxPower = !maxPower;
          props.updateVectorEngrave(props.index, 'power', (nextMaxPower) ? 100 : 99);
        }}
        propValidation={props.propValidation}
        value={toDisplayPower(props.vector.power)}
        validate={props.validationHandler}
      />
      <InputNumber
        label="Passes"
        min="1"
        onBlur={props.saveTemporaryState}
        onChange={(event) => {
          const normalizedValue = asInteger(event.target.value);
          props.updateVectorEngrave(props.index, 'passes', normalizedValue);
        }}
        propValidation={props.propValidation}
        value={props.vector.passes}
      />
      <InputNumber
        label="Focal Offset (mm)"
        onBlur={props.saveTemporaryState}
        onChange={(event) => {
          const normalizedValue = precisionRound(asFloat(event.target.value), 3);
          props.updateVectorEngrave(props.index, 'focalOffset', normalizedValue);
        }}
        propValidation={props.propValidation}
        value={props.vector.focalOffset}
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
        label={`Scan Gap (LPI ${toDisplayLinesPerInch(props.vector.scanGap)}) *`}
        onBlur={props.saveTemporaryState}
        onChange={(event) => {
          const normalizedValue = asInteger(event.target.value);
          props.updateVectorEngrave(props.index, 'scanGap', normalizedValue);
        }}
        propValidation={props.propValidation}
        value={props.vector.scanGap}
        validate={props.validationHandler}
      />
    </>
  );
}
