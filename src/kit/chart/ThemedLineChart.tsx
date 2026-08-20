import React from 'react';
import { ViewStyle } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ThemeColors } from '../theme';

const MIN_STROKE_OPACITY = 0.9;

export function ThemedLineChart(props: {
  labels: string[];
  values: number[];
  /**
   * 주 계열과 함께 그릴 추가 계열. 방식별 비교처럼 여러 곡선을 겹칠 때 쓴다.
   * 색은 앱이 지정한다 - kit 은 브랜드 색 외의 팔레트를 모른다.
   */
  extraSeries?: { values: number[]; color: string }[];
  /** 계열 이름. 주 계열부터 extraSeries 순서로 대응한다. */
  legend?: string[];
  width: number;
  height?: number;
  yAxisSuffix?: string;
  brandColor: string;
  colors: ThemeColors;
  // react-native-chart-kit의 style prop은 Partial<ViewStyle>만 받는다 (StyleProp 불가)
  style?: Partial<ViewStyle>;
  /** 점을 숨긴다. 회차가 많아 점이 뭉개질 때 쓴다. */
  hideDots?: boolean;
  /**
   * 곡선 아래 면 채움을 끈다.
   *
   * chart-kit 은 면을 chartConfig.color 로 칠하기 때문에 계열마다 색을 줘도
   * 면이 겹쳐 곡선 색이 묻힌다. 여러 계열을 겹칠 때는 꺼야 구분이 된다.
   */
  hideFill?: boolean;
  /** y축 라벨 소수점 자릿수. 금액은 보통 0 이 읽기 좋다. 기본 1. */
  decimalPlaces?: number;
}) {
  const { colors, brandColor } = props;

  // chart-kit 은 선 색 콜백에 1 보다 작은 opacity 를 넘길 때가 있어
  // 여러 계열을 겹치면 색이 흐려져 구분이 어렵다. 하한을 둔다.
  const strokeOpacity = (opacity: number) => Math.max(opacity, MIN_STROKE_OPACITY);

  const datasets = [
    {
      data: props.values,
      color: (opacity = 1) => hexToRgba(brandColor, strokeOpacity(opacity)),
      strokeWidth: 2,
    },
    ...(props.extraSeries ?? []).map((series) => ({
      data: series.values,
      color: (opacity = 1) => hexToRgba(series.color, strokeOpacity(opacity)),
      strokeWidth: 2,
    })),
  ];

  return (
    <LineChart
      data={{ labels: props.labels, datasets, legend: props.legend }}
      width={props.width}
      height={props.height ?? 220}
      yAxisSuffix={props.yAxisSuffix ?? ''}
      yAxisInterval={1}
      withDots={!props.hideDots}
      withShadow={!props.hideFill}
      chartConfig={{
        backgroundColor: colors.card,
        backgroundGradientFrom: colors.card,
        backgroundGradientTo: colors.card,
        decimalPlaces: props.decimalPlaces ?? 1,
        color: (opacity = 1) => hexToRgba(brandColor, opacity),
        labelColor: () => colors.subtext,
        propsForDots: { r: '4', strokeWidth: '2', stroke: brandColor },
        propsForBackgroundLines: { stroke: colors.chartGrid },
      }}
      bezier
      style={props.style}
    />
  );
}

// #RRGGBB -> rgba(r, g, b, a)
function hexToRgba(hex: string, opacity: number): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
