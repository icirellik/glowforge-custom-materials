import React from 'react';
import MaterialEditor from './MaterialEditor';
import MaterialList from './MaterialList';
import MaterialViewer from './viewer/MaterialViewer';
import Message from './Message';
import {
  createMaterial,
  removeCloudMaterial,
  removeRawMaterial,
  sendCloudMaterial,
  removeMaterialTitle,
} from './lib/material';
import {
  clearTempMaterial,
  forceSync,
  getBytesInUse,
  getLocalStorage,
  getShouldUpdate,
  reloadGlowForgeTab,
  storeGlowforgeMaterials,
  storeRawMaterials,
  getUISettings,
} from './lib/chromeWrappers';
import {
  EMPTY_MATERIAL,
  TempMaterial,
  MultiSettings,
  MultiSettingsDefaults,
} from './lib/constants';
import './App.css';
import {
  PluginCutSetting,
  PluginMaterial,
} from './lib/materialRaw';
import { GFMaterial } from './lib/materialGlowforge';
import { sha1 } from './lib/utils';
import { readQrCode } from './lib/qrCode';
import { AppHeader } from './AppHeader';
import MaterialButtonBar from './MaterialButtonBar';

export type AddMaterial = () => Promise<void>;
export type CopyMaterial = (title: string) => Promise<void>;
export type EditMaterial = (title: string) => Promise<void>;
export type RemoveMaterial = (title: string) => Promise<void>;
export type SetMaterial = (title: string) => Promise<void>;
export type UpdateMaterial = (key: keyof TempMaterial, value: any) => void;

// Cut Methods
export type UpdateCut = (cut: PluginCutSetting) => void;

// General Purpose MultiSetting Methods
export type AddSetting = (prop: keyof MultiSettings) => void;
export type RemoveSetting = <K extends keyof MultiSettings>(prop: K, index: number) => void;
export type UpdateSetting = <K extends keyof MultiSettings>(prop: K, index: number, setting: MultiSettings[K]) => void;

interface IMaterialEditor {
  addMaterial: AddMaterial;
  copyMaterial: CopyMaterial;
  editMaterial: EditMaterial;
  removeMaterial: RemoveMaterial;
  setMaterial: SetMaterial;
  updateMaterial: UpdateMaterial;

  updateCut: UpdateCut;

  addSetting: AddSetting;
  removeSetting: RemoveSetting;
  updateSetting: UpdateSetting;
}

export type ForceSyncronize = () => Promise<void>;

export type EditorMode =  'DISPLAY' | 'ADD' | 'EDIT' | 'SELECTED';
export type EditorModeChange = (mode: EditorMode, material: TempMaterial) => Promise<void>;
export type ModeAdd = () => Promise<void>;
export type ModeCancel = () => Promise<void>;
export type ModeEdit = (title: string) => Promise<void>;
export type ModeSelect = (title: string) => Promise<void>;

interface IEditorMode {
  changeEditorMode: EditorModeChange;
  setEditorModeAdd: ModeAdd;
  setEditorModeCancel: ModeCancel
  setEditorModeEdit: ModeEdit;
  setEditorModeSelect: ModeSelect;
}

interface AppProps {
  connected: boolean;
  platform: string;
}

interface AppMessage {
  message: string;
  color: string | null;
}

interface AppState {
  action: EditorMode;
  cloudStorageBytesUsed: number;
  materials: GFMaterial[];
  message: AppMessage | null;
  rawMaterials: PluginMaterial[];
  synchronized: boolean;
  rawSvg: string | null;
  tempMaterial: TempMaterial;
}

function sendMessage(message: object) {
  // Forward the request to the GFUI
  window.chrome.runtime.getBackgroundPage((window) => {
    if (window) {
      if (!(window as any).inboundQueue) {
        (window as any).inboundQueue = [];
      }
      (window as any).inboundQueue.push(message);
    }
  });
}

class App extends React.Component<AppProps, AppState> implements IEditorMode, IMaterialEditor {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      action: 'DISPLAY',
      cloudStorageBytesUsed: 0,
      message: null,
      tempMaterial: {
        ...EMPTY_MATERIAL,
      },
      materials: [],
      rawMaterials: [],
      rawSvg: null,
      synchronized: true,
    };

    // Modes
    this.setEditorModeAdd = this.setEditorModeAdd.bind(this);
    this.setEditorModeCancel = this.setEditorModeCancel.bind(this);
    this.setEditorModeEdit = this.setEditorModeEdit.bind(this)
    this.setEditorModeSelect = this.setEditorModeSelect.bind(this)

    // Material
    this.addMaterial = this.addMaterial.bind(this);
    this.copyMaterial = this.copyMaterial.bind(this);
    this.editMaterial = this.editMaterial.bind(this);
    this.removeMaterial = this.removeMaterial.bind(this);
    this.setMaterial = this.setMaterial.bind(this);
    this.updateMaterial = this.updateMaterial.bind(this);

    // Settings
    this.updateCut = this.updateCut.bind(this);

    // MultiSettings
    this.addSetting = this.addSetting.bind(this);
    this.removeSetting = this.removeSetting.bind(this);
    this.updateSetting = this.updateSetting.bind(this);

    // Messaging
    this.displayMessage = this.displayMessage.bind(this);
    this.clearMessage = this.clearMessage.bind(this);

    // Synchronization
    this.forceSyncronize = this.forceSyncronize.bind(this)

    // Validaton
    this.validationHandler = this.validationHandler.bind(this);
  }

  async componentDidMount() {
    // Track the bytes used.
    const cloudStorageBytesUsed = await getBytesInUse();

    // Get the initial state from local storage.
    const localStorage = await getLocalStorage();

    if (localStorage.tempMaterial) {
      this.setState({
        action: 'ADD',
        cloudStorageBytesUsed,
        materials: localStorage.materials!,
        message: {
          message: 'Material settings were automatically restored from a previous session.',
          color: null,
        },
        rawMaterials: localStorage.rawMaterials!,
        synchronized: !localStorage.shouldUpdate,
        tempMaterial: localStorage.tempMaterial,
      });
    } else {
      this.setState({
        cloudStorageBytesUsed,
        materials: localStorage.materials!,
        rawMaterials: localStorage.rawMaterials!,
        synchronized: !localStorage.shouldUpdate,
      });
    }

    /**
     * Start an interval to handle messaging with the background process.
     */
    setInterval(async () => {
      // Refresh the cloud storage in use
      const cloudStorageBytesUsed = await getBytesInUse();

      // Refresh the sync status.
      const shouldUpdate = await getShouldUpdate();

      const uiSettings = await getUISettings();
      const rawSvg = (uiSettings && uiSettings.loadedDesignId) ? `https://storage.googleapis.com/glowforge-files/designs/${uiSettings.loadedDesignId}/svgf/svgf_file.gzip.svg` : null;

      // Update teh state.
      if (this.state.synchronized === shouldUpdate) {
        this.setState({
          cloudStorageBytesUsed,
          rawSvg,
          synchronized: !shouldUpdate,
        });
      } else {
        this.setState({
          cloudStorageBytesUsed,
          rawSvg,
        });
      }

      // Check background threads for messages.
      window.chrome.runtime.getBackgroundPage(async (window) => {
        if (window) {
          const outboundQueue = (window as any).outboundQueue;

          if (outboundQueue.length > 0) {
            const messages = outboundQueue.splice(0);

            for (let i = 0; i < messages.length; i += 1) {

              const message = messages[i];
              switch (message.type) {
                case 'lidImage':
                  const image = `https://app.glowforge.com${message.image}`;

                  const qrCodeData = await readQrCode(image);
                  console.log(qrCodeData);

                  if (qrCodeData && qrCodeData.startsWith('Glowforge')) {
                    this.setState({
                      message: {
                        message: 'Proofgrade material detected.',
                        color: null,
                      },
                    });
                  } else if (qrCodeData && qrCodeData.startsWith('Custom')) {
                    sendMessage({
                      type: 'selectMaterial',
                      materialId: qrCodeData,
                    });
                    this.setState({
                      message: {
                        message: 'Custom material detected.',
                        color: null,
                      },
                    });
                  }
                  break;
              }
            }
          }
        }
      });
    }, 750);
  }

  // Temporary Material State
  // =================================================================

  /**
   * Updates the base material properties: thickName, name, thickness
   */
  updateMaterial(key: keyof TempMaterial, value: string | number) {
    this.setState({
      tempMaterial: {
        ...this.state.tempMaterial,
        [key]: value,
      },
    });
  }

  updateCut(cut: PluginCutSetting) {
    this.setState({
      tempMaterial: {
        ...this.state.tempMaterial,
        cut,
      },
    });
  }

  addSetting(prop: keyof MultiSettings) {
    this.setState((state) => {
      const emptySetting = MultiSettingsDefaults[prop];
      return {
        tempMaterial: {
          ...state.tempMaterial,
          [prop]: [ ...state.tempMaterial[prop], emptySetting ],
        },
      };
    });
  }

  removeSetting<K extends keyof MultiSettings>(prop: K, index: number) {
    this.setState((state) => {
      state.tempMaterial[prop].splice(index, 1);
      return {
        tempMaterial: {
          ...state.tempMaterial,
          [prop]: [...state.tempMaterial[prop]],
        },
      };
    });
  }

  updateSetting<K extends keyof MultiSettings>(prop: K, index: number, setting: MultiSettings[K]) {
    this.setState((state) => {
      const settings = state.tempMaterial[prop];
      settings[index] = setting;
      return {
        tempMaterial: {
          ...state.tempMaterial,
          [prop]: [...settings],
        },
      };
    });
  }

  // Material Management
  // =================================================================

  /**
   *
   */
  async addMaterial() {

    const isValid = Object.keys(this.state.tempMaterial.propValidation).map((key) => {
      return this.state.tempMaterial.propValidation[key];
    }).reduce((prev, cur) => {
      return prev && cur;
    }, true);

    if (!isValid) {
      this.displayMessage('The material is invalid.', '#CF024E');
      return;
    }

    // Hash the title and take the first seven for the id.
    const { thickName, name } = this.state.tempMaterial;
    const title = `${thickName} ${name}`
    const hash = await sha1(title);
    const id = hash.substring(0, 7);

    // Create the new material.
    const newMaterial = createMaterial(this.state.tempMaterial, id);

    // Double check for duplicates
    const duplicate = this.state.materials.find(material => {
      return material.id === newMaterial.id || material.title === newMaterial.title;
    });

    if (duplicate) {
      this.displayMessage('A material with the same name already exists.');
      return;
    }

    // Create and store.
    const newMaterials: GFMaterial[] = [...this.state.materials, newMaterial];
    const newRawMaterials = [...this.state.rawMaterials, this.state.tempMaterial];
    await storeGlowforgeMaterials(newMaterials)
    await storeRawMaterials(newRawMaterials);
    await clearTempMaterial();

    // Send materials to the cloud
    await sendCloudMaterial(this.state.tempMaterial);

    // Update the application state.
    this.setState({
      action: 'DISPLAY',
      tempMaterial: { ...EMPTY_MATERIAL },
      materials: newMaterials,
      message: null,
      rawMaterials: newRawMaterials,
      synchronized: false,
    });
  }

  /**
   * Copies an existing material and appends a '(1)' to its name.
   *
   * @param {string} title
   */
  async copyMaterial(title: string) {
    // Look for any duplicates.
    const duplicates = this.state.materials.filter(material => {
      return material.title === title;
    });

    // There should be at least one since we are cloning.
    if (duplicates.length < 1) {
      this.displayMessage('Could not clone the source material was removed.');
      return;
    }

    // Get the material so we can clone it.
    const material = this.state.rawMaterials.find(rawMaterial => {
      return `${rawMaterial.thickName} ${rawMaterial.name}` === title;
    });

    // Update the application state.
    if (material) {
      this.setState({
        action: 'ADD',
        tempMaterial: {
          ...material,
          name: `${material.name} (${duplicates.length})`,
          propValidation: {},
        },
      });
    }
  }

  /**
   *
   * @param title
   */
  async editMaterial(title: string) {

    const isValid = Object.keys(this.state.tempMaterial.propValidation).map((key) => {
      return this.state.tempMaterial.propValidation[key];
    }).reduce((prev, cur) => {
      return prev && cur;
    }, true);

    if (!isValid) {
      this.displayMessage('The material is invalid.', '#CF024E');
      return;
    }

    const duplicates = this.state.materials.filter(material => {
      return material.title === `${title}`;
    });

    if (duplicates.length !== 1) {
      this.displayMessage('Could not update. A material with the same name already exists.');
      return;
    }

    // Update material using the same id.
    const materialId = duplicates[0].id.split(':')[1];
    const newMaterial = createMaterial(this.state.tempMaterial, materialId)

    // Store
    const newMaterials = this.state.materials.filter(material => {
      return material.title !== `${title}`;
    });
    newMaterials.push(newMaterial)
    const newRawMaterials = this.state.rawMaterials.filter(material => {
      return `${material.thickName} ${material.name}` !== `${title}`;
    });
    newRawMaterials.push(this.state.tempMaterial);

    await storeGlowforgeMaterials(newMaterials)
    await storeRawMaterials(newRawMaterials);

    // Send updated materials to the cloud
    const rawMaterial = this.state.rawMaterials.find(rawMaterial => {
      return `${rawMaterial.thickName} ${rawMaterial.name}` === `${title}`;
    });
    if (rawMaterial) {
      await removeCloudMaterial(rawMaterial);
    }
    await sendCloudMaterial(this.state.tempMaterial);

    // Update the application state.
    this.setState({
      action: 'DISPLAY',
      tempMaterial: { ...EMPTY_MATERIAL },
      materials: newMaterials,
      message: null,
      rawMaterials: newRawMaterials,
      synchronized: false,
    });
  }

  async removeMaterial(title: string) {
    // Look for the material.
    const found = this.state.rawMaterials.find((material: PluginMaterial) => {
      return `${material.thickName} ${material.name}` === `${title}`;
    });

    // If there is no material exit.
    if (!found) {
      return;
    }

    // Remove from cloud, local, and glowforge.
    await removeCloudMaterial(found);
    const materials = await removeMaterialTitle(title);
    const rawMaterials = await removeRawMaterial(title);

    // Update the application state.
    this.setState({
      action: 'DISPLAY',
      tempMaterial: { ...EMPTY_MATERIAL },
      materials,
      rawMaterials,
      synchronized: false,
    });

    // Reload the tab to ensure everything is up to date.
    // TOOD: Do we need this.
    await reloadGlowForgeTab();
  }

  /**
   * Sets the selected material in the GFUI.
   *
   * @param title
   */
  async setMaterial(title: string) {
    // Hash the title and take the first seven for the id.
    const hash = await sha1(title);
    const id = `Custom:${hash.substring(0, 7)}`;

    sendMessage({
      type: 'selectMaterial',
      materialId: id,
    });
  }

  async forceSyncronize() {
    await forceSync();
    this.setState({
      synchronized: false,
    });
  }

  // Messaging
  //

  displayMessage(message: string, color: string = '#CC3A4B') {
    this.setState({
      message: {
        message,
        color,
      },
    });
  }

  clearMessage() {
    this.setState({
      message: null,
    });
  }

  // Modes
  // =================================================================

  /**
   * Changes the edit mode and clears any temporary material set in local
   * storage along with resetting the current in progress material.
   *
   * @param mode
   * @param material
   */
  async changeEditorMode(mode: EditorMode, material: TempMaterial = EMPTY_MATERIAL) {
    await clearTempMaterial();

    this.setState({
      action: mode,
      tempMaterial: {
        ...material,
      },
      message: null,
    });
  }

  /**
   * Switches to `add material` mode and resets the current material state to
   * a blank material.
   */
  async setEditorModeAdd() {
    await this.changeEditorMode('ADD');
  }

  /**
   * Cancels the current input mode, resetting the materiall state and clearing
   * any system messages.
   */
  async setEditorModeCancel() {
    await this.changeEditorMode('DISPLAY');
  }

  /**
   * Switches to `edit material` mode and opens up an existing material for
   * alterations.
   *
   * @param title The material title in the form `thickName name`
   */
  async setEditorModeEdit(title: string) {
    const rawMaterial = this.state.rawMaterials.find(rawMaterial => {
      return `${rawMaterial.thickName} ${rawMaterial.name}` === title;
    });
    await this.changeEditorMode('EDIT', {
      ...rawMaterial!,
      propValidation: {},
    });
  }

  /**
   * Switches to `selected mode` opens up a material for viewing its current
   * settings.
   *
   * @param title The material title in the form `thickName name`
   */
  async setEditorModeSelect(title: string) {
    const rawMaterial = this.state.rawMaterials.find(rawMaterial => {
      return `${rawMaterial.thickName} ${rawMaterial.name}` === title;
    });
    await this.changeEditorMode('SELECTED', {
      ...rawMaterial!,
      propValidation: {},
    });
  }

  validationHandler(id: string, isValid: boolean) {
    const tempMaterial = {
      ...this.state.tempMaterial,
    };
    tempMaterial.propValidation[id] = isValid;

    this.setState({
      tempMaterial,
    });
  }

  render() {
    const intro = (this.state.materials.length === 0) ? (
      <div className="intro">
        <p>Add your own custom material settings here.</p>
      </div>
    ) : null;

    let svg = null;
    if (this.state.rawSvg) {
      svg = (<a className="buttonBar_download" href={this.state.rawSvg} target="_blank" rel="noopener noreferrer">Download Raw SVG/Trace</a>);
    }

    return (
      <div className="App">
        <AppHeader
          connected={this.props.connected}
          forceSyncronize={this.forceSyncronize}
          synchronized={this.state.synchronized}
          cloudStorageBytesUsed={this.state.cloudStorageBytesUsed}
        />
        <div className={`columns ${(this.props.platform === 'mac') ? 'osx' : ''}`}>
          <div className="col-materials">
            <MaterialList
              cloneMaterial={this.copyMaterial}
              editMaterial={this.setEditorModeEdit}
              materials={this.state.rawMaterials}
              removeMaterial={this.removeMaterial}
              selectMaterial={this.setEditorModeSelect}
              setMaterial={this.setMaterial}
            />
          </div>
          <div className="column__right">
            <div className="buttonBar">
              <MaterialButtonBar
                editorMode={this.state.action}
                addMaterial={this.addMaterial}
                newMaterial={this.setEditorModeAdd}
                cancelMaterial={this.setEditorModeCancel}
                editMaterial={this.editMaterial}
                title={`${this.state.tempMaterial.thickName} ${this.state.tempMaterial.name}`}
              />
              {svg}
            </div>
            <div className="col-contents">
              <div className="col-contents-container">
                {intro}
                <MaterialViewer
                  editorMode={this.state.action}
                  material={this.state.tempMaterial}
                />
                <MaterialEditor
                  action={this.state.action}
                  addSetting={this.addSetting}
                  removeSetting={this.removeSetting}
                  updateSetting={this.updateSetting}
                  material={this.state.tempMaterial}
                  updateCut={this.updateCut}
                  updateMaterial={this.updateMaterial}
                  validationHandler={this.validationHandler}
                />
              </div>
            </div>
          </div>
        </div>
        {
          this.state.message !== null ?
            <Message clearMessage={this.clearMessage} {...this.state.message} /> : null
        }
      </div>
    );
  }
}

export default App;
