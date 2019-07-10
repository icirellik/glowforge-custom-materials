import React from 'react';
import ScoreSetting from './ScoreSetting';
import IconPlus from '../icons/IconPlus';
import { PluginScoreSetting } from '../material/materialPlugin';

// Score Methods
export type AddScore = () => void;
export type RemoveScore = (index: number) => void;
export type UpdateScore =
  <K extends keyof PluginScoreSetting>(index: number,
    prop: K, value: PluginScoreSetting[K]) => void;

type ScoreSettingsProps = {
  addScore: AddScore;
  removeScore: RemoveScore;
  scores: PluginScoreSetting[];
  saveTemporaryState: () => void;
  updateScore: UpdateScore;
  validationHandler: (id: string, isValid: boolean) => void;
}

export default function ScoreSettings(props: ScoreSettingsProps) {
  return (
    <>
      <div className="form-header">
        <p>Score Settings</p>
        <div>
          <IconPlus
            click={props.addScore}
            className="icon-button-add"
            fill="#001f23"
            height="18px"
            width="18px"
          />
        </div>
      </div>
      {
        props.scores.map((score, index) => {
          return (
            <ScoreSetting
              index={index}
              score={score}
              saveTemporaryState={props.saveTemporaryState}
              removeScore={props.removeScore}
              updateScore={props.updateScore}
              validationHandler={props.validationHandler}
            />
          );
        })
      }
    </>
  )
}
