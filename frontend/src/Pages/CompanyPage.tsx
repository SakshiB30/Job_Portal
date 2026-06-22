import { Button, Loader } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Company from "../Components/CompanyProfile/Company";
import SimilarCompanies from "../Components/CompanyProfile/SimilarCompanies";
import { getCompanyProfile } from "../Services/ProfileService";
import type { ProfileState } from "../Types";

const CompanyPage = () => {
  const navigate = useNavigate();
  const { name } = useParams<{ name: string }>();
  const [companyData, setCompanyData] = useState<ProfileState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!name) {
      setLoading(false);
      setError(true);
      return;
    }
    setLoading(true);
    setError(false);
    getCompanyProfile(name)
      .then((data) => {
        setCompanyData(data);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [name]);

  return (
    <div>
      <div className="site-page">
        <div className="site-container">
        <Button my="md" onClick={() => navigate(-1)} leftSection={<IconArrowLeft size={20} />} color="brightSun.4" variant="light">
          Back
        </Button>

        <div className="flex flex-col lg:flex-row site-grid-gap justify-between">
          {loading ? (
            <div className="flex w-full items-center justify-center py-16">
              <Loader color="brightSun.4" />
            </div>
          ) : error ? (
            <div className="flex w-full items-center justify-center py-16">
              <div className="text-center text-mine-shaft-300">
                <div className="text-2xl font-semibold text-mine-shaft-200">Company not found</div>
                <div className="mt-2 text-sm">No company profile found for &quot;{name}&quot;.</div>
              </div>
            </div>
          ) : (
            <Company data={companyData} />
          )}
          <SimilarCompanies />
        </div>
      </div>
    </div>
  </div>
  );
};

export default CompanyPage
