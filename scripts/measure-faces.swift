import Foundation
import Vision
import AppKit
// Prints, per image, normalized (top-left origin) face box, eye centres, and chin (lowest face-contour point).
for path in CommandLine.arguments.dropFirst() {
  guard let img = NSImage(contentsOfFile: path), let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else { print(path, "ERR load"); continue }
  let req = VNDetectFaceLandmarksRequest()
  let h = VNImageRequestHandler(cgImage: cg, options: [:])
  try? h.perform([req])
  guard let f = (req.results ?? []).max(by: { $0.boundingBox.width < $1.boundingBox.width }) else { print(path, "NOFACE"); continue }
  let b = f.boundingBox
  func pts(_ r: VNFaceLandmarkRegion2D?) -> [CGPoint] { guard let r = r else { return [] }; return r.normalizedPoints.map { CGPoint(x: b.minX + $0.x * b.width, y: 1 - (b.minY + $0.y * b.height)) } }
  func centre(_ p: [CGPoint]) -> CGPoint { CGPoint(x: p.map{$0.x}.reduce(0,+)/Double(p.count), y: p.map{$0.y}.reduce(0,+)/Double(p.count)) }
  let le = centre(pts(f.landmarks?.leftPupil).isEmpty ? pts(f.landmarks?.leftEye) : pts(f.landmarks?.leftPupil))
  let re = centre(pts(f.landmarks?.rightPupil).isEmpty ? pts(f.landmarks?.rightEye) : pts(f.landmarks?.rightPupil))
  let contour = pts(f.landmarks?.faceContour)
  let chin = contour.max(by: { $0.y < $1.y }) ?? .zero
  let name = (path as NSString).lastPathComponent
  print(String(format: "%@ box=(%.4f,%.4f,%.4f,%.4f) leye=(%.4f,%.4f) reye=(%.4f,%.4f) chin=(%.4f,%.4f)", name, b.minX, 1-b.maxY, b.width, b.height, le.x, le.y, re.x, re.y, chin.x, chin.y))
}
