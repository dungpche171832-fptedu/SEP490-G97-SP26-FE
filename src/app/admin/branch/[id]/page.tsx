import BranchDetail from "@/components/branch/BranchDetail";

export default function BranchDetailPage({ params }: { params: { branchdetail: string } }) {
  return <BranchDetail id={params.branchdetail} />;
}
