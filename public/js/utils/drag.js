function withDraggableList({ container, onDrop }) {
  let draggedItem = null;
  let sourceZone = null;

  container.addEventListener('dragstart', event => {
    const target = event.target.closest('[data-draggable-id]');
    if (!target) return;
    draggedItem = target;
    sourceZone = target.closest('[data-drop-zone]') || null;
    event.dataTransfer.effectAllowed = 'move';
    if (event.dataTransfer.setDragImage) {
      const rect = target.getBoundingClientRect();
      event.dataTransfer.setDragImage(target, rect.width / 2, rect.height / 2);
    }
    event.dataTransfer.setData('text/plain', target.dataset.draggableId);
    requestAnimationFrame(() => target.classList.add('dragging'));
  });

  container.addEventListener('dragend', () => {
    if (draggedItem) draggedItem.classList.remove('dragging');
    draggedItem = null;
    sourceZone = null;
  });

  container.addEventListener('dragover', event => {
    if (!draggedItem) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  });

  container.addEventListener('drop', event => {
    event.preventDefault();
    const draggableId = event.dataTransfer.getData('text/plain');
    const dropZone = event.target.closest('[data-drop-zone]');
    if (!draggableId || !dropZone) return;
    onDrop({ draggableId, dropZone, sourceZone, event });
  });
}

export { withDraggableList };

