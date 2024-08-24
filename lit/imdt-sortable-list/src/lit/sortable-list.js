import { LitElement, html, css } from 'lit';

class SortableList extends LitElement {
  static properties = {
    items: { type: Array }
  };

  constructor() {
    super();
    this.items = [];
  }

  firstUpdated() {
    this._addDragAndDropListeners(this.shadowRoot.querySelectorAll('.draggable'));
  }

  _addDragAndDropListeners(elements) {
    elements.forEach(item => {
      item.draggable = true;
      item.addEventListener('dragstart', this._onDragStart.bind(this));
      item.addEventListener('dragover', this._onDragOver.bind(this));
      item.addEventListener('drop', this._onDrop.bind(this));
    });
  }

  _onDragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.dataset.index);
    event.dataTransfer.setData('parent-index', event.target.dataset.parentIndex || '');
  }

  _onDragOver(event) {
    event.preventDefault();
  }

  _onDrop(event) {
    event.preventDefault();
    const oldIndex = event.dataTransfer.getData('text/plain');
    const oldParentIndex = event.dataTransfer.getData('parent-index');
    const newIndex = event.target.dataset.index;
    const newParentIndex = event.target.dataset.parentIndex || '';

    let oldList = oldParentIndex ? this.items[oldParentIndex].children : this.items;
    let newList = newParentIndex ? this.items[newParentIndex].children : this.items;

    const [movedItem] = oldList.splice(oldIndex, 1);
    newList.splice(newIndex, 0, movedItem);
    this.requestUpdate();
  }

  render() {
    return html`
      <ul class="list">
        ${this.items.map((item, index) => this._renderItem(item, index))}
      </ul>
    `;
  }

  _renderItem(item, index, parentIndex = '') {
    return html`
      <li class="draggable" data-index="${index}" data-parent-index="${parentIndex}">
        ${item.label}
        ${item.children ? html`
          <ul>
            ${item.children.map((child, childIndex) => this._renderItem(child, childIndex, index))}
            <li class="draggable" data-index="${item.children.length}" data-parent-index="${index}">Drop here</li>
          </ul>
        ` : ''}
      </li>
    `;
  }

  static styles = css`
    .list {
      list-style-type: none;
      padding: 0;
    }
    .list li {
      padding: 8px;
      margin: 4px;
      background: #f0f0f0;
      border: 1px solid #ccc;
      cursor: move;
    }
    .list li[data-index=""] {
      background: #e0e0e0;
      border: 1px dashed #ccc;
      cursor: default;
    }
  `;
}

customElements.define('sortable-list', SortableList);
