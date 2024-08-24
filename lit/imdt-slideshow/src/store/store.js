import {getUrlParams, onVLE, loadAllData, saveData} from '@ou-imdt/utils'

export const store = {
    vleParams: getUrlParams(),
    isOnline: onVLE(),
    activityAttachments: {},
    activityFolders: {},
    singleSaveData: {
        default: {}
    },
    globalSaveData: {
        default: {}
    },
    /**
     * Replaces default console.log(). Will provide debugging information for local development or when the verbose URL query parameter is supplied.
     * @param msg
     */
    log(msg) {
        this.vleParams.verbose || !VLE.serverversion ? console.log(msg) : null
    }, /**
     * Replaces default console.error(). Will provide debugging information for local development or when the verbose URL query parameter is supplied.
     * @param msg
     */
    error(msg) {
        this.vleParams.verbose || !VLE.serverversion ? console.error(msg) : null
    }, /**
     * Replaces default console.warn(). Will provide debugging information for local development or when the verbose URL query parameter is supplied.
     * @param msg
     */
    warn(msg) {
        this.vleParams.verbose || !VLE.serverversion ? console.warn(msg) : null
    },
    /**
     * Converts objects to be saved into a format that can be accepted by the VLE. {string: string}
     * @param obj
     * @return 
     */
    serialiseDataForSave(obj) {
        let serialisedSaveData = {}
        Object.entries(obj).forEach((ent) => {
            serialisedSaveData[ent[0]] = JSON.stringify(ent[1])
        })
        return serialisedSaveData
    },
    /**
     * Saves store.singleSaveData to the VLE. Data is saved as single user save / user parameter set to true.
     * @return void
     */
    saveSingleData() {
        saveData({
            user: true,
            values: this.serialiseDataForSave(this.singleSaveData)
        }).then(
            () => {},
            (reason) => this.error(`VLE Save failed: ${reason}`)
        )
    } /**
     * Saves store.globalSaveData to the VLE. Data is saved as global save / user parameter set to false.
     * @return void
     */,
    saveGlobalData() {
        saveData({
            user: false,
            values: this.serialiseDataForSave(this.globalSaveData)
        }).then(
            () => {},
            (reason) => this.error(`VLE Save failed: ${reason}`)
        )
    } /**
     * Retrieves all single user data on the VLE and assigns it to store.singleSaveData
     * @return void
     */,
    getAllSingleData() {
        loadAllData({ user: true }).then(
            (response) => {
                Object.entries(response).forEach((ent) => {
                    this.isOnline
                        ? (this.singleSaveData[ent[0]] = JSON.parse(ent[1]))
                        : (this.singleSaveData[ent[0].split(':')[1]] = JSON.parse(ent[1]))
                })
            },
            (reason) => this.error(`Single data fetch failed: ${reason}`)
        )
    } /**
     * Retrieves all global data on the VLE and assigns it to store.globalSaveData
     * @return void
     */,
    getAllGlobalData() {
        loadAllData({ user: false }).then(
            (response) => {
                Object.entries(response).forEach((ent) => {
                    this.isOnline
                        ? (this.globalSaveData[ent[0]] = JSON.parse(ent[1]))
                        : (this.globalSaveData[ent[0].split('global:')[1]] = JSON.parse(ent[1]))
                })
            },
            (reason) => this.error(`Global data fetch failed: ${reason}`)
        )
    } /**
     * Parses the iframe URL and stores the URL of attachments in store.activityAttachments
     * @return void
     */,
    splitOutAttachments() {
        Object.keys(this.vleParams).forEach((x) => {
            if (
                (this.vleParams[x].includes('https') || this.vleParams[x].includes('http')) &&
                !this.vleParams[x].includes('zip')
            ) {
                this.activityAttachments[x] = this.vleParams[x]
                delete this.vleParams[x]
            }
        })
    } /**
     * Parses the iframe URL and stores the contents of folders in store.activityFolders
     * @returns {Promise<any>}
     */,
    splitOutFolders() {
        return new Promise((resolve, reject) => {
            Object.keys(this.vleParams).forEach((x) => {
                if (this.vleParams[x].includes('zip')) {
                    window.VLE.get_folder(x, (url) => {
                        this.activityFolders[x] = url
                    })
                    delete this.vleParams[x]
                }
            })
            resolve('Split')
        })
    } /**
     * Runs the helper functions required to initialise an activity.
     * @returns {Promise<void>}
     */,
    async prepareActivity() {
        this.getAllSingleData()
        this.getAllGlobalData()
        this.splitOutAttachments()
        await this.splitOutFolders().catch(() =>
            this.error('Unable to split folders (incorrect url)')
        )
    }

}