# ThreeJS入门

## 安装

```ts
npm install three
```

## 引入

```ts
// 方式 1: 导入整个 three.js核心库
import * as THREE from 'three';
```

```js
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const controls = new OrbitControls( camera, renderer.domElement );
```

在HTML文件中引入ThreeJS，方式1：

```ts
使用ES6语法
<script type="module">
	import * as THREE from './build/three.module.js';
</script>
```

在HTML文件中引入ThreeJS，方式2：

```ts
<script type="importmap">
	{
        "imports": {
            "three": "https://unpkg.com/three@<version>/build/three.module.js",
            "three/addons/": "https://unpkg.com/three@<version>/examples/jsm/"
        }
	}
</script>

<script type="module">
	import * as THREE from 'three';
	console.log(THREE.Scene);
</script>
```

