import '@/css/styles.css'
import { setupDefaultResizer } from '@ou-imdt/utils'
setupDefaultResizer()
import {store} from "./store/store.js"
import localData from './data/data.json'
import './lit/imdt-slideshow.css';
import './lit/imdt-slideshow.js'

let data = store.vleParams.data ? await fetch(store.vleParams.data).then(r => r.json()).then(content => content) : localData;

store.prepareActivity().then(r => store.log("Activity scaffolded")).catch(reason => store.error(reason))