import { getDefaultParams, getUrlParams, VleModule } from '@ou-imdt/utils';
import { defineStore } from 'pinia';

const vleUtils = new VleModule();

export const useGlobalStore = defineStore('store', {
  state: () => ({
    fileHandle : null,
    fileName : null,
    zipfiles  : {},
    dataloaded : false,
    /**
     * 
     * @type {Boolean} Indicates if running inside the VLE.
     * @default false (Offline)
     */
    isOnline: vleUtils.onVLE(),
    /**
     * Object containing the default VLE parameters as key-value pairs.
     * '_c', '_i', '_p', '_a', '_s', '_u'
     * @type {Object<string, string>}
     */
    defaultVLEParams: getDefaultParams(),
    /**
     * Object containing the URL parameters as key-value pairs.
     * @type {Object<string, string>}
     */
    urlParams: getUrlParams(),
    /**
     * A mapping of parameter keys to their resolved file attachment URLs.
     * @type {Object<string, string>}
     */
    fileAttachments: {},
    /**
     * A mapping of parameter keys to their resolved folder attachment URLs.
     * @type {Object<string, string>}
     */
    folderAttachments: {},
    /**
     * User-specific data objects.
     * @type {Object<string, any>}
     */
    userData: {
      default: {}
    },
    /**
     * Global data objects.
     */
    globalData: {
      default: {}
    }
  }),
  actions: {
    /**
     * Outputs error to console if in development environment or verbose is set to true
     * @param msg
     * @return void
     */
    error (...msg) {
      this.urlParams.verbose || !this.isOnline ? console.error(...msg) : null;
    },
    /**
     * Outputs log to console if in development environment or verbose is set to true
     * @param msg
     * @return void
     */
    log (...msg) {
      this.urlParams.verbose || !this.isOnline ? console.log(...msg) : null;
    },
    /**
     * Saves store.userData to the VLE.
     * @return {Promise<void>} A promise that resolves on successful save or rejects on error.
     */
    saveUserData () {
      return vleUtils
        .saveData({
          user: true,
          values: this.serialiseDataForSave(this.userData)
        })
        .then(
          () => {},
          reason => this.error(`${this.isOnline ? 'VLE':'Local'} Save failed: ${reason}`)
        );
    },
    /**
     * Saves store.globalData to the VLE.
     * @return {Promise<void>} A promise that resolves on successful save or rejects on error.
     */
    saveGlobalData () {
      return vleUtils
        .saveData({
          user: false,
          values: this.serialiseDataForSave(this.globalData)
        })
        .then(
          () => {},
          reason => this.error(`${this.isOnline ? 'VLE':'Local'} Save failed: ${reason}`)
        );
    },
    /**
     * Converts objects to be saved into a format that can be accepted by the VLE. {string: string}
     * @param obj
     * @return 
     */
    serialiseDataForSave (obj) {
      let serialisedSaveData = {}
      Object.entries(obj).forEach(ent => {
        serialisedSaveData[ent[0]] = JSON.stringify(ent[1])
      })
      return serialisedSaveData
    },
    /**
     * Retrieves all single user data on the VLE and assigns it to store.userData
     * @returns {Promise<void>} A promise that resolves when user data is fetched and assigned, or rejects on error.
     */
    getUserData () {
      return vleUtils
        .loadAllData({
          user: true
        })
        .then(
          response => {
            Object.entries(response).forEach(ent => {
              this.isOnline
                ? (this.userData[ent[0]] = JSON.parse(ent[1]))
                : (this.userData[ent[0].split(':')[1]] = JSON.parse(ent[1]));
            });
          },
          reason => this.error(`User data fetch failed: ${reason}`)
        );
    },
    /**
     * Retrieves all global data on the VLE and assigns it to store.globalData
     * @returns {Promise<void>} A promise that resolves when global data is fetched and assigned, or rejects on error.
     */
    getGlobalData () {
      return vleUtils
        .loadAllData({
          user: false
        })
        .then(
          response => {
            Object.entries(response).forEach(ent => {
              this.isOnline
                ? (this.globalData[ent[0]] = JSON.parse(ent[1]))
                : (this.globalData[ent[0].split('global:')[1]] = JSON.parse(ent[1]));
            });
          },
          reason => this.error(`Global data fetch failed: ${reason}`)
        );
    },
    /**
     * Parses the iframe URL and stores the URL of attachments in store.fileAttachments
     * @return void
     */
    splitOutAttachments () {
      Object.keys(this.urlParams).forEach(x => {
        const value = this.urlParams[x];
        if (value.includes('http') && value.includes('zip')) {
          this.fileAttachments[x] = value;
          delete this.urlParams[x];
        }
      });
    },
    /**
     * Parses the iframe URL and stores the contents of folders in store.folderAttachments
     * @returns {Promise<any>}
     */
    splitOutFolders () {
      return new Promise(resolve => {
        Object.keys(this.urlParams).forEach(x => {
          const value = this.vleParams[x];
          if (value.includes('zip')) {
            window.VLE.get_folder(x, url => {
              this.folderAttachments[x] = url;
            });
            delete this.urlParams[x];
          }
        });
        resolve('Split');
      });
    },
    /**
     * Outputs warning to console if in development environment or verbose is set to true
     * @param msg
     * @return void
     */
    warn (...msg) {
      this.urlParams.verbose || !this.isOnline ? console.warn(...msg) : null;
    },
    /**
     * Runs the helper functions required to initialise an widget.
     * @returns {Promise<void>}
     */
    async prepareWidget () {
      await this.getUserData();
      await this.getGlobalData();
      this.splitOutAttachments();
      await this.splitOutFolders().catch(() =>
        this.error('Unable to split folders (incorrect url)')
      );
    }
  }
});
