require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Categoria = require('../models/Categoria');
const Producto = require('../models/Producto');

const categorias = [
  { nombre: 'Procesadores',           descripcion: 'CPUs Intel y AMD para todos los segmentos' },
  { nombre: 'Tarjetas de Video',      descripcion: 'GPUs NVIDIA y AMD para gaming y trabajo profesional' },
  { nombre: 'Placas Madre',           descripcion: 'Motherboards para plataformas Intel y AMD' },
  { nombre: 'Memoria RAM',            descripcion: 'Módulos DDR4 y DDR5 para escritorio' },
  { nombre: 'Almacenamiento',         descripcion: 'SSDs NVMe, SATA y HDDs' },
  { nombre: 'Fuentes de Alimentación',descripcion: 'Fuentes ATX certificadas 80 Plus' },
  { nombre: 'Gabinetes',              descripcion: 'Cases ATX, mATX y ITX con buen flujo de aire' },
];

const productosPorCategoria = {
  'Procesadores': [
    { nombre: 'Intel Core i5-13600K',  descripcion: '14 núcleos (6P+8E), 3.5GHz base, socket LGA1700, sin cooler',       precio: 280000, stock: 15 },
    { nombre: 'Intel Core i7-13700K',  descripcion: '16 núcleos (8P+8E), 3.4GHz base, socket LGA1700, sin cooler',       precio: 420000, stock: 10 },
    { nombre: 'Intel Core i9-13900K',  descripcion: '24 núcleos (8P+16E), 3.0GHz base, socket LGA1700, sin cooler',      precio: 650000, stock: 5  },
    { nombre: 'AMD Ryzen 5 7600X',     descripcion: '6 núcleos, 4.7GHz base, socket AM5, incluye Wraith Stealth',        precio: 260000, stock: 18 },
    { nombre: 'AMD Ryzen 9 7950X',     descripcion: '16 núcleos, 4.5GHz base, socket AM5, sin cooler, 170W TDP',         precio: 720000, stock: 4  },
  ],
  'Tarjetas de Video': [
    { nombre: 'NVIDIA GeForce RTX 3060 12GB',    descripcion: 'GPU Ampere, 12GB GDDR6, DLSS 2.0, ray tracing, 170W TDP',       precio: 480000,  stock: 8 },
    { nombre: 'NVIDIA GeForce RTX 4070 12GB',    descripcion: 'GPU Ada Lovelace, 12GB GDDR6X, DLSS 3.0, 200W TDP',             precio: 850000,  stock: 6 },
    { nombre: 'NVIDIA GeForce RTX 4090 24GB',    descripcion: 'GPU Ada Lovelace, 24GB GDDR6X, flagship gaming, 450W TDP',      precio: 1800000, stock: 2 },
    { nombre: 'AMD Radeon RX 6700 XT 12GB',      descripcion: 'GPU RDNA 2, 12GB GDDR6, FidelityFX Super Resolution, 230W TDP', precio: 420000,  stock: 9 },
    { nombre: 'AMD Radeon RX 7900 XTX 24GB',     descripcion: 'GPU RDNA 3, 24GB GDDR6, DisplayPort 2.1, 355W TDP',             precio: 980000,  stock: 3 },
  ],
  'Placas Madre': [
    { nombre: 'ASUS ROG Strix B660-F Gaming WiFi', descripcion: 'Socket LGA1700, DDR5, PCIe 5.0, WiFi 6E, 3x M.2',     precio: 210000, stock: 12 },
    { nombre: 'MSI MAG Z790 Tomahawk WiFi',        descripcion: 'Socket LGA1700, DDR5, PCIe 5.0, WiFi 6E, 4x M.2',     precio: 310000, stock: 7  },
    { nombre: 'Gigabyte B550 AORUS Elite AX',      descripcion: 'Socket AM4, DDR4, PCIe 4.0, WiFi 6, 2x M.2',          precio: 195000, stock: 10 },
    { nombre: 'ASRock X670E Taichi',               descripcion: 'Socket AM5, DDR5, PCIe 5.0, Thunderbolt 4, 3x M.2',   precio: 480000, stock: 4  },
  ],
  'Memoria RAM': [
    { nombre: 'Corsair Vengeance 16GB DDR4 3200MHz',     descripcion: 'Kit 2x8GB, CL16, compatible Intel y AMD, perfil bajo', precio: 85000,  stock: 25 },
    { nombre: 'Kingston Fury Beast 32GB DDR5 5200MHz',   descripcion: 'Kit 2x16GB, CL40, XMP 3.0, compatible Intel 12/13 Gen', precio: 160000, stock: 14 },
    { nombre: 'G.Skill Trident Z5 64GB DDR5 6000MHz',   descripcion: 'Kit 2x32GB, CL36, XMP 3.0, RGB, para workstation',     precio: 310000, stock: 6  },
    { nombre: 'TeamGroup T-Force 16GB DDR5 4800MHz',     descripcion: 'Kit 2x8GB, CL40, compatible JEDEC, precio accesible',  precio: 95000,  stock: 20 },
  ],
  'Almacenamiento': [
    { nombre: 'Samsung 970 EVO Plus 1TB NVMe M.2', descripcion: 'PCIe 3.0 x4, lectura 3500MB/s, escritura 3300MB/s, 5 años garantía', precio: 95000,  stock: 20 },
    { nombre: 'WD Black SN850X 2TB NVMe M.2',      descripcion: 'PCIe 4.0 x4, lectura 7300MB/s, escritura 6600MB/s, heatsink incluido', precio: 175000, stock: 10 },
    { nombre: 'Seagate Barracuda HDD 4TB SATA',    descripcion: '7200RPM, caché 256MB, SATA III 6Gb/s, ideal para almacenamiento masivo', precio: 62000,  stock: 15 },
    { nombre: 'Crucial BX500 SSD 2TB SATA',        descripcion: 'Lectura 540MB/s, escritura 500MB/s, SATA III, factor 2.5"',            precio: 78000,  stock: 18 },
  ],
  'Fuentes de Alimentación': [
    { nombre: 'Corsair RM750x 750W 80+ Gold',          descripcion: 'Modular completo, cero RPM en carga baja, 10 años garantía',   precio: 120000, stock: 14 },
    { nombre: 'EVGA SuperNOVA 850W 80+ Platinum',      descripcion: 'Modular completo, 92% eficiencia, 10 años garantía, ECO mode', precio: 165000, stock: 8  },
    { nombre: 'Seasonic Focus GX-1000W 80+ Gold',      descripcion: 'Modular completo, Cybenetics Gold, 10 años garantía',          precio: 210000, stock: 6  },
    { nombre: 'be quiet! Pure Power 11 600W 80+ Gold', descripcion: 'Semi-modular, ventilador de 120mm silencioso, 5 años garantía', precio: 95000,  stock: 16 },
  ],
  'Gabinetes': [
    { nombre: 'NZXT H510 Flow ATX Mid Tower',          descripcion: 'Panel frontal mesh, 2 ventiladores 120mm incluidos, vidrio templado', precio: 98000,  stock: 12 },
    { nombre: 'Fractal Design Meshify 2 ATX',          descripcion: 'Flujo de aire optimizado, 3 ventiladores 140mm, vidrio templado',     precio: 145000, stock: 7  },
    { nombre: 'Lian Li Lancool 216 ATX Mid Tower',     descripcion: '2 ventiladores 160mm frontales, excelente airflow, vidrio templado',  precio: 115000, stock: 9  },
    { nombre: 'Corsair 4000D Airflow ATX Mid Tower',   descripcion: 'Panel frontal mesh, 2 ventiladores 120mm incluidos, cable management', precio: 105000, stock: 11 },
  ],
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB conectado');

    await Producto.deleteMany({});
    await Categoria.deleteMany({});
    console.log('✓ Colecciones limpiadas');

    const categoriasInsertadas = await Categoria.insertMany(categorias);
    console.log(`✓ ${categoriasInsertadas.length} categorías insertadas`);

    const mapaIds = {};
    for (const cat of categoriasInsertadas) {
      mapaIds[cat.nombre] = cat._id;
    }

    const productos = [];
    for (const [nombreCat, items] of Object.entries(productosPorCategoria)) {
      for (const item of items) {
        productos.push({ ...item, categoriaId: mapaIds[nombreCat] });
      }
    }

    const productosInsertados = await Producto.insertMany(productos);
    console.log(`✓ ${productosInsertados.length} productos insertados`);

    console.log('\nResumen:');
    for (const cat of categoriasInsertadas) {
      const count = productos.filter(p => p.categoriaId.toString() === cat._id.toString()).length;
      console.log(`  • ${cat.nombre}: ${count} productos`);
    }

    console.log('\n¡Seed completado exitosamente!');
  } catch (error) {
    console.error('Error en seed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
