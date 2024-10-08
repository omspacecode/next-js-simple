import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next';
import { useRouter } from 'next/router';
import { BuilderComponent, builder, useIsPreviewing, Builder } from '@builder.io/react';
import '@builder.io/widgets';
import DefaultErrorPage from 'next/error';
import Head from 'next/head';
import builderConfig from '@config/builder';
// loading widgets dynamically to reduce bundle size, will only be included in bundle when is used in the content
import '@builder.io/widgets/dist/lib/builder-widgets-async';

import TrustpilotWidget from "../components/TrustpilotWidget/TrustpilotWidget";

builder.init(builderConfig.apiKey)

Builder.registerComponent(TrustpilotWidget, {
  name: "Trustpilot Widget",
  inputs: [
    { name: "locale", type: "string", defaultValue: "en-US" },
    { name: "templateId", type: "string", defaultValue: "53aa8912dec7e10d38f59f36" },
    { name: "businessUnitId", type: "string", defaultValue: "639f548cf3952ee4a156d9ce" },
    { name: "styleHeight", type: "string", defaultValue: "140px" },
    { name: "styleWidth", type: "string", defaultValue: "100%" },
    { name: "theme", type: "string", enum: ["light", "dark"], defaultValue: "light" },
    { name: "stars", type: "string", defaultValue: "4,5" },
    { name: "reviewLanguages", type: "string", defaultValue: "en" },
  ],
});

builder.apiVersion = "v3";

let cars = [
  {
    "color": "purple",
    "type": "minivan",
    "registration": new Date('2017-01-03'),
    "capacity": 7
  },
  {
    "color": "red",
    "type": "station wagon",
    "registration": new Date('2018-03-03'),
    "capacity": 5
  }
];

export async function getStaticProps({
  params,
}: GetStaticPropsContext<{ page: string[] }>) {
  const page =
    (await builder
      .get('page', {
        userAttributes: {
          urlPath: '/' + (params?.page?.join('/') || ''),
        },
      })
      .toPromise()) || null
  
  const dataModel = await builder.getAll('artworks', {
        options: {
          vercelPreview: true,
        },
      })
  
  return {
    props: {
      page,
      dataModel,
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 5 seconds
    revalidate: 5,
  }
}

export async function getStaticPaths() {
  const pages = await builder.getAll('page', {
    options: { noTargeting: true },
    omit: 'data.blocks',
  })

  return {
    paths: pages.map((page) => `${page.data?.url}`),
    fallback: true,
  }
}

export default function Page({
  page, dataModel
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter()
  const isPreviewingInBuilder = useIsPreviewing()
  const show404 = !page && !isPreviewingInBuilder

  if (router.isFallback) {
    return <h1>Loading...</h1>
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {!page && <meta name="robots" content="noindex" />}
      </Head>
      {show404 ? (
        <DefaultErrorPage statusCode={404} />
      ) : (
        <BuilderComponent model="page" content={page} data={{myCars: cars}} />
      )}
    </>
  )
}
