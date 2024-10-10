import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
    title: string;
    Svg: React.ComponentType<React.ComponentProps<'svg'>>;
    description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
    {
        title: '阅读',
        Svg: require('@site/static/img/Homepage-reading.svg').default,
        description: (
            <>
                进一寸有一寸的欢喜
            </>
        ),
    },
    {
        title: '专注',
        Svg: require('@site/static/img/Homepage-patient.svg').default,
        description: (
            <>
                心之所向, 无问东西
            </>
        ),
    },
    {
        title: '勇气',
        Svg: require('@site/static/img/Homepage-courage.svg').default,
        description: (
            <>
                成功不是终点, 失败也并非末日
            </>
        ),
    },
];

function Feature({ title, Svg, description }: FeatureItem) {
    return (
        <div className={clsx('col col--4')}>
            <div className="text--center">
                <Svg className={styles.featureSvg} role="img" />
            </div>
            <div className="text--center padding-horiz--md">
                <Heading as="h3">{title}</Heading>
                <p>{description}</p>
            </div>
        </div>
    );
}

export default function HomepageFeatures(): JSX.Element {
    return (
        <section className={styles.features}>
            <div className="container">
                <div className="row">
                    {FeatureList.map((props, idx) => (
                        <Feature key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}
