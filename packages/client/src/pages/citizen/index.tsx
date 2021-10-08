import type { GetServerSideProps } from "next";
import type { Citizen } from "types/prisma";
import Link from "next/link";
import { Layout } from "components/Layout";
import { handleRequest } from "lib/fetch";
import { getSessionUser } from "lib/auth";
import Head from "next/head";
import { getTranslations } from "lib/getTranslation";
import { useTranslations } from "use-intl";
import { Button } from "components/Button";
import { ModalIds } from "types/ModalIds";
import { useModal } from "src/hooks/useModal";
import { RegisterVehicleModal } from "components/citizen/RegisterVehicleModal";

interface Props {
  citizens: Citizen[];
}

export default function CitizenPage({ citizens }: Props) {
  const t = useTranslations("Citizen");
  const { openModal, closeModal } = useModal();

  return (
    <Layout>
      <Head>
        <title>{t("citizens")} - SnailyCAD</title>
      </Head>

      <h1 className="text-3xl font-semibold mb-3">Citizens</h1>

      <ul className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-3">
        <Link href="/citizen/create">
          <a className="py-1.5 px-3 text-white bg-gray-500 hover:bg-gray-600 rounded-md transition-all">
            {t("createCitizen")}
          </a>
        </Link>
        <Button onClick={() => openModal(ModalIds.RegisterVehicle)} className="text-left">
          {t("registerVehicle")}
        </Button>
        <Button onClick={() => openModal(ModalIds.RegisterWeapon)} className="text-left">
          {t("registerWeapon")}
        </Button>
      </ul>

      <ul
        className={
          citizens.length <= 0
            ? "flex flex-col space-y-3"
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
        }
      >
        {citizens.length <= 0 ? (
          <p className="text-gray-600 font-medium">{t("userNoCitizens")}</p>
        ) : (
          citizens.map((citizen) => (
            <li
              key={citizen.id}
              className="p-3  bg-gray-200 rounded-md flex justify-between items-center"
            >
              <div className="flex items-center space-x-3">
                <img
                  draggable={false}
                  className="rounded-full w-14"
                  src="https://yt3.ggpht.com/yJ9oovZC3P9YSil0Wjk7UgnYnLORTSwP_wFjAvqJ_m-z08zpTwll2rnWqYsXUVGb-Dlh_fqeaw=s88-c-k-c0x00ffffff-no-nd-rj"
                />

                <p className="text-xl font-semibold">
                  {citizen.name} {citizen.surname}
                </p>
              </div>

              <div>
                <Link href={`/citizen/${citizen.id}`}>
                  <a className="py-1.5 px-3 text-white bg-gray-500 hover:bg-gray-600 rounded-md transition-all">
                    {t("viewCitizen")}
                  </a>
                </Link>
              </div>
            </li>
          ))
        )}
      </ul>

      <RegisterVehicleModal
        onCreate={() => closeModal(ModalIds.RegisterVehicle)}
        citizens={citizens}
        vehicle={null}
      />
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ locale, req }) => {
  const { data } = await handleRequest<any[]>("/citizen", {
    headers: req.headers,
  }).catch(() => ({ data: null }));

  const { data: values = [] } = await handleRequest(
    "/admin/values/weapon?paths=license,vehicle",
  ).catch(() => ({ data: null }));

  return {
    props: {
      values,
      citizens: data ?? [],
      session: await getSessionUser(req.headers),
      messages: {
        ...(await getTranslations(["citizen"], locale)),
      },
    },
  };
};
