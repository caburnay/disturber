'use client';

import React from 'react';
import { useDisturbers } from './use-disturbers';
import { Disturber } from './utils';

export function Disturbers() {
  const disturbers = useDisturbers();
  return (
    <>
      {disturbers.map(d => (
        <DisturberRenderer key={d.id} disturber={d} disturbers={disturbers} />
      ))}
    </>
  );
}

function DisturberRenderer({
  disturber,
  disturbers,
}: {
  disturber: Disturber;
  disturbers: Disturber[];
}) {
  const { Component, props, id } = disturber;
  const openDisturbers = disturbers.filter(d => d.props.open);
  const topDisturber = openDisturbers[openDisturbers.length - 1];
  const atTop = topDisturber ? topDisturber.id === id : false;
  return <Component key={id} {...props} atTop={atTop} />;
}
