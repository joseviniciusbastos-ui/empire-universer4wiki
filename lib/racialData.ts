export interface RacialStat {
    range: string;
    bonus: string;
}

export interface Race {
    id: string;
    name: string;
    summary: string;
    moduleName: string;
    moduleDesc: string;
    images?: string[];
    demonstrationImage?: string;
    moduleImage?: string;
    stats: {
        agua: RacialStat;
        gravidade: RacialStat;
        temperatura: RacialStat;
        magnetismo: RacialStat;
        vento_solar: RacialStat;
        atmosfera: RacialStat;
    };
}

export const RACES: Race[] = [
    {
        id: 'abissais',
        name: 'Abissais (Abysseens)',
        summary: 'Os Abissais são criaturas adaptadas a ambientes de alta pressão e água abundante. Eles prosperam em oceanos profundos e mundos aquáticos, com resistência natural às profundezas esmagadoras.',
        moduleName: 'Mini Coletor de Destroços Aprimorado - Abysseens',
        moduleDesc: 'Módulo de mini coletor de destroços otimizado para Abysseens com +20% de estatísticas melhoradas',
        images: [
            '/images/races/abissais/abyssal-1.jpg',
            '/images/races/abissais/abyssal-2.jpg',
            '/images/races/abissais/abyssal-3.jpg',
            '/images/races/abissais/abyssal-4.jpg',
            '/images/races/abissais/abyssal-5.jpg',
            '/images/races/abissais/abyssal-6.jpg',
            '/images/races/abissais/abyssal-7.jpg',
            '/images/races/abissais/abyssal-8.jpg'
        ],
        demonstrationImage: '/images/races/abissais/abyssal-1.jpg',
        moduleImage: '/images/races/abissais/abyssal-module.jpg',
        stats: {
            agua: { range: '80% - 100%', bonus: '+30%' },
            gravidade: { range: '1.5G - 2.5G', bonus: '+20%' },
            temperatura: { range: '-50ºC - 20ºC', bonus: '+15%' },
            magnetismo: { range: '20 - 40', bonus: '+10%' },
            vento_solar: { range: '0 - 20', bonus: '+25%' },
            atmosfera: { range: '60% - 80%', bonus: '+15%' }
        }
    },
    {
        id: 'aerials',
        name: 'Aerions (Aérions)',
        summary: 'Os Aerions são seres etéreos que flutuam em atmosferas densas. Eles preferem ambientes de baixa gravidade ricos em gases, onde podem planar sem esforço.',
        moduleName: 'Mini Balista Aprimorada - Aerions',
        moduleDesc: 'Módulo de mini balista otimizado para Aerions com +20% de estatísticas melhoradas',
        images: [
            '/images/races/aerion/aerion-1.jpg',
            '/images/races/aerion/aerion-2.jpg',
            '/images/races/aerion/aerion-3.jpg',
            '/images/races/aerion/aerion-4.jpg',
            '/images/races/aerion/aerion-5.jpg',
            '/images/races/aerion/aerion-6.jpg',
            '/images/races/aerion/aerion-7.jpg',
            '/images/races/aerion/aerion-8.jpg'
        ],
        demonstrationImage: '/images/races/aerion/aerion-1.jpg',
        moduleImage: '/images/races/aerion/aerion-module.jpg',
        stats: {
            agua: { range: '0% - 20%', bonus: '+20%' },
            gravidade: { range: '0.3G - 0.7G', bonus: '+30%' },
            temperatura: { range: '10ºC - 40ºC', bonus: '+10%' },
            magnetismo: { range: '60 - 80', bonus: '+15%' },
            vento_solar: { range: '40 - 60', bonus: '+10%' },
            atmosfera: { range: '90% - 100%', bonus: '+30%' }
        }
    },
    {
        id: 'lithars',
        name: 'Lithars',
        summary: 'Os Lithars são formas de vida baseadas em silício nascidas de mundos vulcânicos. Eles prosperam em calor extremo e radiação, seus corpos cristalinos impermeáveis a temperaturas que vaporizariam outros.',
        moduleName: 'Mini Laser Aprimorado - Lithars',
        moduleDesc: 'Módulo de mini laser otimizado para Lithars com +20% de estatísticas melhoradas',
        images: [
            '/images/races/lithars/lithar-1.jpg',
            '/images/races/lithars/lithar-2.jpg',
            '/images/races/lithars/lithar-3.jpg',
            '/images/races/lithars/lithar-4.jpg',
            '/images/races/lithars/lithar-5.jpg',
            '/images/races/lithars/lithar-6.jpg',
            '/images/races/lithars/lithar-7.jpg',
            '/images/races/lithars/lithar-8.jpg'
        ],
        demonstrationImage: '/images/races/lithars/lithar-1.jpg',
        moduleImage: '/images/races/lithars/lithar-module.jpg',
        stats: {
            agua: { range: '0% - 30%', bonus: '+25%' },
            gravidade: { range: '2G - 3G', bonus: '+20%' },
            temperatura: { range: '100ºC - 300ºC', bonus: '+30%' },
            magnetismo: { range: '70 - 100', bonus: '+15%' },
            vento_solar: { range: '60 - 100', bonus: '+20%' },
            atmosfera: { range: '0% - 30%', bonus: '+15%' }
        }
    },
    {
        id: 'mecalitas',
        name: 'Mecalitas (Mécalythes)',
        summary: 'Os Mecalitas são seres cibernéticos que dependem de campos eletromagnéticos fortes. Eles se destacam em ambientes magneticamente ativos, extraindo energia dos núcleos planetários.',
        moduleName: 'Mini Escudo Aprimorado - Mecalythes',
        moduleDesc: 'Módulo de mini escudo otimizado para Mecalythes com +20% de estatísticas melhoradas',
        images: [
            '/images/races/mecalitas/mecalita-1.jpg',
            '/images/races/mecalitas/mecalita-2.jpg',
            '/images/races/mecalitas/mecalita-3.jpg',
            '/images/races/mecalitas/mecalita-4.jpg',
            '/images/races/mecalitas/mecalita-5.jpg',
            '/images/races/mecalitas/mecalita-6.jpg',
            '/images/races/mecalitas/mecalita-7.jpg',
            '/images/races/mecalitas/mecalita-8.jpg'
        ],
        demonstrationImage: '/images/races/mecalitas/mecalita-1.jpg',
        moduleImage: '/images/races/mecalitas/mecalita-module.jpg',
        stats: {
            agua: { range: '10% - 40%', bonus: '+20%' },
            gravidade: { range: '0.86 - 1.5G', bonus: '+10%' },
            temperatura: { range: '-100ºC - 100ºC', bonus: '+15%' },
            magnetismo: { range: '80 - 100', bonus: '+30%' },
            vento_solar: { range: '20 - 50', bonus: '+20%' },
            atmosfera: { range: '30% - 60%', bonus: '+10%' }
        }
    },
    {
        id: 'nemorix',
        name: 'Nemorix (Némoryx)',
        summary: 'Os Némorix são criaturas florestais adaptadas a climas temperados. Eles florescem em atmosferas exuberantes e ricas em oxigênio com temperaturas e umidade moderadas.',
        moduleName: 'Mini Extrator de Asteroides Aprimorado - Nemoryx',
        moduleDesc: 'Módulo de mini extrator de asteroides otimizado para Nemoryx com +20% de estatísticas melhoradas',
        images: [
            '/images/races/nemorix/nemorix-1.jpg',
            '/images/races/nemorix/nemorix-2.jpg',
            '/images/races/nemorix/nemorix-3.jpg',
            '/images/races/nemorix/nemorix-4.jpg',
            '/images/races/nemorix/nemorix-5.jpg',
            '/images/races/nemorix/nemorix-6.jpg',
            '/images/races/nemorix/nemorix-7.jpg',
            '/images/races/nemorix/nemorix-8.jpg'
        ],
        demonstrationImage: '/images/races/nemorix/nemorix-1.jpg',
        moduleImage: '/images/races/nemorix/nemorix-module.jpg',
        stats: {
            agua: { range: '40% - 70%', bonus: '+20%' },
            gravidade: { range: '0.6G - 1.2G', bonus: '+15%' },
            temperatura: { range: '15ºC - 35ºC', bonus: '+25%' },
            magnetismo: { range: '30 - 50', bonus: '+10%' },
            vento_solar: { range: '10 - 30', bonus: '+20%' },
            atmosfera: { range: '70% - 90%', bonus: '+25%' }
        }
    },
    {
        id: 'silvae',
        name: 'Silvae (Sylvaë)',
        summary: 'Os Silvae são seres vegetais delicados que requerem proteção contra radiação intensa. Eles prosperam em mundos protegidos com atmosferas densas e luz estelar suave.',
        moduleName: 'Mini Transporte de Tropas Aprimorado - Sylvae',
        moduleDesc: 'Módulo de mini transporte de tropas otimizado para Sylvae com +20% de estatísticas melhoradas',
        images: [
            '/images/races/silvae/silvae-1.jpg',
            '/images/races/silvae/silvae-2.jpg',
            '/images/races/silvae/silvae-3.jpg',
            '/images/races/silvae/silvae-4.jpg',
            '/images/races/silvae/silvae-5.jpg',
            '/images/races/silvae/silvae-6.jpg',
            '/images/races/silvae/silvae-7.jpg',
            '/images/races/silvae/silvae-8.jpg'
        ],
        demonstrationImage: '/images/races/silvae/silvae-1.jpg',
        moduleImage: '/images/races/silvae/silvae-module.jpg',
        stats: {
            agua: { range: '50% - 80%', bonus: '+25%' },
            gravidade: { range: '0.5G - 1G', bonus: '+20%' },
            temperatura: { range: '5ºC - 25ºC', bonus: '+20%' },
            magnetismo: { range: '10 - 30', bonus: '+10%' },
            vento_solar: { range: '0 - 20', bonus: '+30%' },
            atmosfera: { range: '80% - 100%', bonus: '+25%' }
        }
    },
    {
        id: 'terranos',
        name: 'Terranos (Terrans)',
        summary: 'Os Terranos são humanos adaptáveis que podem sobreviver em uma ampla gama de condições. Embora não se destaquem em lugar nenhum, também não lutam em lugar nenhum - verdadeiros generalistas galácticos.',
        moduleName: 'Mini Warp Aprimorado - Terrans',
        moduleDesc: 'Módulo de mini warp otimizado para Terrans com +20% de estatísticas melhoradas',
        images: [
            '/images/races/terranos/terranos-1.jpg',
            '/images/races/terranos/terranos-2.jpg',
            '/images/races/terranos/terranos-3.jpg',
            '/images/races/terranos/terranos-4.jpg',
            '/images/races/terranos/terranos-5.jpg',
            '/images/races/terranos/terranos-6.jpg',
            '/images/races/terranos/terranos-7.jpg',
            '/images/races/terranos/terranos-8.jpg'
        ],
        demonstrationImage: '/images/races/terranos/terranos-1.jpg',
        moduleImage: '/images/races/terranos/terranos-module.jpg',
        stats: {
            agua: { range: '30% - 70%', bonus: '+15%' },
            gravidade: { range: '0.8G - 1.2G', bonus: '+20%' },
            temperatura: { range: '-10ºC - 40ºC', bonus: '+15%' },
            magnetismo: { range: '25 - 55', bonus: '+10%' },
            vento_solar: { range: '10 - 40', bonus: '+15%' },
            atmosfera: { range: '60% - 90%', bonus: '+20%' }
        }
    },
    {
        id: 'xyrrh',
        name: 'Xyrrh',
        summary: 'Os Xyrrh são sobreviventes resistentes de terras áridas. Eles prosperam em condições quentes e secas onde outros pereceriam, seus corpos adaptados para conservar cada gota de umidade.',
        moduleName: 'Mini Carga Aprimorada - Xyrrh',
        moduleDesc: 'Módulo de mini carga otimizado para Xyrrh com +20% de estatísticas melhoradas',
        images: [
            '/images/races/xyrrh/xyrrh-1.jpg',
            '/images/races/xyrrh/xyrrh-2.jpg',
            '/images/races/xyrrh/xyrrh-3.jpg',
            '/images/races/xyrrh/xyrrh-4.jpg',
            '/images/races/xyrrh/xyrrh-5.jpg',
            '/images/races/xyrrh/xyrrh-6.jpg',
            '/images/races/xyrrh/xyrrh-7.jpg',
            '/images/races/xyrrh/xyrrh-8.jpg'
        ],
        demonstrationImage: '/images/races/xyrrh/xyrrh-1.jpg',
        moduleImage: '/images/races/xyrrh/xyrrh-module.jpg',
        stats: {
            agua: { range: '0% - 20%', bonus: '+25%' },
            gravidade: { range: '1G - 2G', bonus: '+15%' },
            temperatura: { range: '50ºC - 200ºC', bonus: '+25%' },
            magnetismo: { range: '40 - 70', bonus: '+10%' },
            vento_solar: { range: '50 - 80', bonus: '+20%' },
            atmosfera: { range: '10% - 40%', bonus: '+20%' }
        }
    }
];
