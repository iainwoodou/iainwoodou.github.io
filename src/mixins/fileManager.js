import JSZip from 'jszip';

const fileManager = {
    data() {
        return {
        }
    },
    methods: {
      async getIMDfile() {
        const file = await this.store.fileHandle.getFile();
        if (!file) return;
        this.processFile(file);
      },

      async fetchIMDfile(url) {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error('Network response was not ok');
          const data = await response.arrayBuffer();
          this.processIMDdata(data);
        } catch (error) {
          console.error('Failed to fetch zip file:', error);
        }
      },

      async handleFileChooser(event) {
        const file = event.target.files[0];
        if (!file) return;
        this.processFile(file);
      },

      async processFile(file) {
        this.store.fileName= file.name
        const reader = new FileReader();
        reader.onload = async (e) => {
          const data = e.target.result;
          this.processIMDdata(data);
        };
        reader.readAsArrayBuffer(file);
      },

      async processIMDdata(data) {
        const zip = await JSZip.loadAsync(data);
        console.log(zip.files);

        for (const filename in zip.files) {
          const file = zip.file(filename);
          if(file){
          let o = {};
          
          if (/\.(jpe?g|png|gif|bmp)$/i.test(filename)) {
            const blob = await file.async('blob');
            const url = URL.createObjectURL(blob);
            o.type = 'img';
            o.data = url;
          } else {
            const content = await file.async('string');
            o.type = 'txt';
            o.data = content;
                if(filename.endsWith('.json')){
                o.data = JSON.parse(content);
              }


          }
          this.store.zipfiles[filename] = o;
          console.log(filename);
        }
      }

      this.store.dataloaded = true

      },

      async exportIMDFile() {
        const zip = new JSZip();
        for (const filename in this.store.zipfiles) {
          const file = this.store.zipfiles[filename];
          if (file.type === 'img') {
            const response = await fetch(file.data);
            const blob = await response.blob();
            zip.file(filename, blob);
          } else {
            if (typeof file.data === 'object') {
              zip.file(filename, JSON.stringify(file.data));
            } else {
              zip.file(filename, file.data);
            }
          }
        }
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.store.fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
    },
    created() {
      if ("launchQueue" in window && "files" in window.LaunchParams.prototype) {
          window.launchQueue.setConsumer(async (launchParams) => {
            if (!launchParams.files.length) {
              return;
            }
            this.store.fileHandle = launchParams.files[0];
            this.getIMDfile();
          });
        }
    },
    mounted() {
      window.addEventListener('keydown', this.handleKeyPress);
    },
    beforeDestroy() {
      window.removeEventListener('keydown', this.handleKeyPress);
    }
}
export default fileManager;