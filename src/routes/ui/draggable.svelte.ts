export function createDraggable() {
	let left = $state(0);
	let top = $state(0);
	const css = $derived(`transform: translate(${left}px, ${top}px);`);

	let startLeft = 0;
	let startTop = 0;

	let startX = 0;
	let startY = 0;

	let moving = false;

	function onpointerdown(e: PointerEvent) {
		startLeft = left;
		startTop = top;
		startX = e.clientX;
		startY = e.clientY;
		moving = true;
	}

	function onpointermove(e: PointerEvent) {
		if (moving) {
			left = startLeft + e.clientX - startX;
			top = startTop + e.clientY - startY;
		}
	}

	function onpointerup() {
		moving = false;
	}

	return {
		handle: {
			onpointerdown
		},
		root: {
			onpointermove,
			onpointerup
		},
		resetPosition() {
			left = 0;
			top = 0;
		},
		container: {
			get style() {
				return css;
			}
		}
	};
}
