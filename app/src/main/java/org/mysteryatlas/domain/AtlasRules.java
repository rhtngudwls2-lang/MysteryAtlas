package org.mysteryatlas.domain;
import java.util.*;

/** Android-independent rules shared by the app and executable JVM QA. */
public final class AtlasRules {
 private AtlasRules() {}
 public static String daily(String date, List<String> ids, Set<String> done, String existing) {
  if (existing != null && ids.contains(existing)) return existing;
  List<String> candidates = new ArrayList<>();
  for (String id : ids) if (!done.contains(id)) candidates.add(id);
  if (candidates.isEmpty()) candidates.addAll(ids);
  Collections.sort(candidates);
  return candidates.isEmpty() ? null : candidates.get(Math.floorMod(date.hashCode(), candidates.size()));
 }
 public static String random(List<String> ids, Set<String> done, Random rng) {
  List<String> candidates = new ArrayList<>();
  for(String id:ids) if(!done.contains(id)) candidates.add(id);
  if(candidates.isEmpty()) candidates.addAll(ids);
  return candidates.isEmpty() ? null : candidates.get(rng.nextInt(candidates.size()));
 }
 public static class Pin {
  public final String id; public final float x,y;
  public Pin(String id,float x,float y) { this.id=id; this.x=x; this.y=y; }
 }
 public static class Cluster {
  public final List<Pin> pins=new ArrayList<>();
  public float x,y;
  Cluster(Pin pin) { pins.add(pin); x=pin.x; y=pin.y; }
 }
 /** Spatial hash plus connected components; overlapping pins join across cell edges. */
 public static List<Cluster> cluster(List<Pin> pins,float cellSize) {
  if(cellSize<=0) throw new IllegalArgumentException("cellSize");
  int[] parent=new int[pins.size()];
  Map<String,List<Integer>> cells=new HashMap<>();
  for(int i=0;i<pins.size();i++) {
   parent[i]=i; Pin pin=pins.get(i);
   int x=(int)Math.floor(pin.x/cellSize),y=(int)Math.floor(pin.y/cellSize);
   for(int dx=-1;dx<=1;dx++)for(int dy=-1;dy<=1;dy++) {
    for(int j:cells.getOrDefault((x+dx)+":"+(y+dy),Collections.emptyList())) {
     Pin q=pins.get(j);float px=pin.x-q.x,py=pin.y-q.y;
     if(px*px+py*py<cellSize*cellSize) parent[root(parent,i)]=root(parent,j);
    }
   }
   cells.computeIfAbsent(x+":"+y,k->new ArrayList<>()).add(i);
  }
  Map<Integer,Cluster> groups=new LinkedHashMap<>();
  for(int i=0;i<pins.size();i++) {
   Pin pin=pins.get(i);int r=root(parent,i);Cluster c=groups.get(r);
   if(c==null)groups.put(r,new Cluster(pin));
   else {int n=c.pins.size();c.x=(c.x*n+pin.x)/(n+1);c.y=(c.y*n+pin.y)/(n+1);c.pins.add(pin);}
  }
  return new ArrayList<>(groups.values());
 }
 private static int root(int[] parent,int i) {while(parent[i]!=i){parent[i]=parent[parent[i]];i=parent[i];}return i;}
 public static class Session {
  private final long start;
  public Long firstMarker=null, firstStart=null, firstComplete=null;
  public int markerTaps=0,randomUsed=0,archiveOpened=0;
  public final Set<String> started=new LinkedHashSet<>(),completed=new LinkedHashSet<>();
  public String firstCompletedId=null, secondCaseId=null, secondEntry=null;
  public Session(long now) {start=now;}
  public void marker(long now) {markerTaps++;if(firstMarker==null)firstMarker=now-start;}
  public void startCase(String id,String entry,long now) {
   started.add(id);if(firstStart==null)firstStart=now-start;
   if(firstCompletedId!=null&&!id.equals(firstCompletedId)&&secondCaseId==null) {secondCaseId=id;secondEntry=entry;}
  }
  public void complete(String id,long now) {
   completed.add(id);if(firstComplete==null){firstComplete=now-start;firstCompletedId=id;}
  }
  public long duration(long now) {return Math.max(0,now-start);}
 }
}
