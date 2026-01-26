import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { colors } from '../theme/colors';

interface DonutChartData {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string | number;
}

export function DonutChart({
  data,
  size = 100,
  strokeWidth = 12,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const total = data.reduce((sum, item) => sum + item.value, 0);

  // 각 세그먼트의 시작 오프셋 계산
  let cumulativeOffset = 0;
  const segments = data.map((item) => {
    const percentage = total > 0 ? item.value / total : 0;
    const dashArray = circumference * percentage;
    const dashOffset = circumference - cumulativeOffset;
    cumulativeOffset += dashArray;

    return {
      ...item,
      percentage,
      dashArray,
      dashOffset,
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* 배경 원 */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.bgTertiary}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* 데이터 세그먼트 */}
        <G rotation="-90" origin={`${center}, ${center}`}>
          {segments.map((segment, index) => (
            <Circle
              key={index}
              cx={center}
              cy={center}
              r={radius}
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segment.dashArray} ${circumference}`}
              strokeDashoffset={segment.dashOffset}
              strokeLinecap="round"
              fill="transparent"
            />
          ))}
        </G>
      </Svg>
      {/* 중앙 텍스트 */}
      {(centerLabel || centerValue !== undefined) && (
        <View style={styles.centerTextContainer}>
          {centerValue !== undefined && (
            <Text style={styles.centerValue}>{centerValue}</Text>
          )}
          {centerLabel && (
            <Text style={styles.centerLabel}>{centerLabel}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  centerLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textTertiary,
    marginTop: 2,
  },
});
