import branchesJson from "../../../data/branches.json";

interface Props {
	subProfessionId: string;
}

const TraitInfo: React.FC<Props> = ({ subProfessionId }) => {
	const { trait } =
		branchesJson[subProfessionId as keyof typeof branchesJson];
	return <span dangerouslySetInnerHTML={{ __html: trait.en_US }} />;
};
export default TraitInfo;
