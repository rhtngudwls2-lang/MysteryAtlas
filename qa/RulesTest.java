import java.util.*;
import org.mysteryatlas.domain.AtlasRules;
public class RulesTest {
 static int checks=0;
 static void check(boolean ok,String name){if(!ok)throw new AssertionError(name);checks++;System.out.println("PASS "+name);}
 public static void main(String[] args) {
  var ids=List.of("bloop","wow","voynich");var done=Set.of("bloop","wow");
  check("voynich".equals(AtlasRules.daily("2026-09-12",ids,done,null)),"daily prefers uninvestigated");
  check("bloop".equals(AtlasRules.daily("2026-09-12",ids,done,"bloop")),"daily remains fixed after completion");
  check(AtlasRules.daily("2026-09-12",List.of(),Set.of(),null)==null,"empty daily safe");
  var reverse=new ArrayList<>(ids);Collections.reverse(reverse);
  check(AtlasRules.daily("2026-09-12",ids,Set.of(),null).equals(AtlasRules.daily("2026-09-12",reverse,Set.of(),null)),"daily independent of content ordering");
  check(ids.contains(AtlasRules.daily("2026-09-12",ids,new HashSet<>(ids),null)),"all-complete daily fallback");
  Random rng=new Random(123);
  for(int i=0;i<100;i++)if(!"voynich".equals(AtlasRules.random(ids,done,rng)))throw new AssertionError("random completed repeat");
  check(true,"100 random selections avoid investigated cases");
  check(ids.contains(AtlasRules.random(ids,new HashSet<>(ids),rng)),"all-complete random fallback");
  check(AtlasRules.random(List.of(),Set.of(),rng)==null,"empty random safe");
  var pins=List.of(new AtlasRules.Pin("a",51,0),new AtlasRules.Pin("b",53,0),new AtlasRules.Pin("c",200,0));
  var clusters=AtlasRules.cluster(pins,52);
  check(clusters.size()==2&&clusters.get(0).pins.size()==2,"overlapping pins cluster across grid edges");
  var many=new ArrayList<AtlasRules.Pin>();for(int i=0;i<500;i++)many.add(new AtlasRules.Pin("p"+i,i%20*50,i/20*50));
  check(AtlasRules.cluster(many,48).stream().mapToInt(c->c.pins.size()).sum()==500,"500 pins retained by clustering");
  check(AtlasRules.cluster(List.of(),52).isEmpty(),"empty markers safe");
  var s=new AtlasRules.Session(1000);
  s.marker(1200);s.marker(1300);s.startCase("bloop","map",1500);s.startCase("bloop","map",1600);
  check(s.firstMarker==200&&s.firstStart==500&&s.markerTaps==2&&s.started.size()==1,"first timings and unique starts");
  s.complete("bloop",2000);s.startCase("bloop","archive",2100);
  check(s.secondCaseId==null,"reopening first case is not conversion");
  s.startCase("wow","map",2500);
  check("wow".equals(s.secondCaseId)&&"map".equals(s.secondEntry)&&s.firstComplete==1000,"case 1 to distinct case 2 with route");
  s.startCase("voynich","related",2700);
  check("wow".equals(s.secondCaseId)&&s.duration(3000)==2000,"conversion captured once and session duration");
  System.out.println("TOTAL "+checks+" PASS");
 }
}
